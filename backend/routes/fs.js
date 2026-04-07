const { Router } = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware');

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRoot(userId) {
  const root = db.prepare(
    "SELECT * FROM fs_nodes WHERE user_id = ? AND parent_id IS NULL AND name = '/'"
  ).get(userId);
  if (!root) {
    const err = new Error('User filesystem not initialized');
    err.status = 500;
    throw err;
  }
  return root;
}

function resolvePath(userId, pathStr) {
  const parts = pathStr.split('/').filter(Boolean);
  let node = getRoot(userId);

  for (const part of parts) {
    const child = db.prepare(
      'SELECT * FROM fs_nodes WHERE user_id = ? AND parent_id = ? AND name = ?'
    ).get(userId, node.id, part);
    if (!child) return null;
    node = child;
  }

  return node;
}

function resolveParentAndName(userId, pathStr) {
  const parts = pathStr.split('/').filter(Boolean);
  if (parts.length === 0) {
    const err = new Error('Invalid path');
    err.status = 400;
    throw err;
  }

  const name = parts[parts.length - 1];
  const parentPath = '/' + parts.slice(0, -1).join('/');
  const parent = resolvePath(userId, parentPath);

  if (!parent) {
    const err = new Error(`Parent directory not found: ${parentPath}`);
    err.status = 404;
    throw err;
  }
  if (parent.node_type !== 'directory') {
    const err = new Error('Parent is not a directory');
    err.status = 400;
    throw err;
  }

  return { parent, name };
}

function buildTree(userId) {
  const nodes = db.prepare('SELECT * FROM fs_nodes WHERE user_id = ?').all(userId);

  // Build lookup maps
  const byId = new Map();
  const childrenOf = new Map();
  let root = null;

  for (const node of nodes) {
    byId.set(node.id, node);
    if (node.parent_id === null) {
      root = node;
    } else {
      if (!childrenOf.has(node.parent_id)) {
        childrenOf.set(node.parent_id, []);
      }
      childrenOf.get(node.parent_id).push(node);
    }
  }

  if (!root) {
    const err = new Error('User filesystem not initialized');
    err.status = 500;
    throw err;
  }

  function buildNode(node) {
    if (node.node_type === 'file') {
      return {
        type: 'file',
        content: node.content || '',
        createdAt: node.created_at || null,
        modifiedAt: node.modified_at || null,
      };
    }

    const children = childrenOf.get(node.id) || [];
    const childrenDict = {};
    for (const child of children) {
      childrenDict[child.name] = buildNode(child);
    }

    return { type: 'directory', children: childrenDict };
  }

  return buildNode(root);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/fs/tree
router.get('/tree', (req, res) => {
  res.json(buildTree(req.user.id));
});

// GET /api/fs/read-dir?path=/
router.get('/read-dir', (req, res) => {
  const pathStr = req.query.path || '/';
  const node = resolvePath(req.user.id, pathStr);

  if (!node) return res.status(404).json({ detail: 'Directory not found' });
  if (node.node_type !== 'directory') return res.status(400).json({ detail: 'Not a directory' });

  const children = db.prepare('SELECT * FROM fs_nodes WHERE parent_id = ?').all(node.id);
  res.json(
    children.map((c) => ({
      name: c.name,
      type: c.node_type,
      modifiedAt: c.modified_at || null,
      size: c.content ? c.content.length : null,
    }))
  );
});

// GET /api/fs/read-file?path=...
router.get('/read-file', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const node = resolvePath(req.user.id, pathStr);
  if (!node) return res.status(404).json({ detail: 'File not found' });
  if (node.node_type !== 'file') return res.status(400).json({ detail: 'Not a file' });

  res.json({ content: node.content || '' });
});

// PUT /api/fs/write-file?path=...
router.put('/write-file', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const { content } = req.body;
  const node = resolvePath(req.user.id, pathStr);

  if (node && node.node_type === 'directory') {
    return res.status(400).json({ detail: 'Path is a directory' });
  }

  if (node) {
    db.prepare(
      "UPDATE fs_nodes SET content = ?, modified_at = datetime('now') WHERE id = ?"
    ).run(content, node.id);
  } else {
    const { parent, name } = resolveParentAndName(req.user.id, pathStr);
    db.prepare(
      "INSERT INTO fs_nodes (user_id, parent_id, name, node_type, content) VALUES (?, ?, ?, 'file', ?)"
    ).run(req.user.id, parent.id, name, content);
  }

  res.json({ ok: true });
});

// POST /api/fs/create-dir?path=...
router.post('/create-dir', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const existing = resolvePath(req.user.id, pathStr);
  if (existing) return res.status(409).json({ detail: 'Already exists' });

  const { parent, name } = resolveParentAndName(req.user.id, pathStr);
  db.prepare(
    "INSERT INTO fs_nodes (user_id, parent_id, name, node_type) VALUES (?, ?, ?, 'directory')"
  ).run(req.user.id, parent.id, name);

  res.json({ ok: true });
});

// DELETE /api/fs/delete?path=...
router.delete('/delete', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });
  if (pathStr === '/' || pathStr === '') return res.status(400).json({ detail: 'Cannot delete root' });

  const node = resolvePath(req.user.id, pathStr);
  if (!node) return res.status(404).json({ detail: 'Not found' });

  db.prepare('DELETE FROM fs_nodes WHERE id = ?').run(node.id);
  res.json({ ok: true });
});

// PATCH /api/fs/rename?path=...
router.patch('/rename', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const { newName } = req.body;
  if (!newName || newName.length < 1 || newName.length > 255) {
    return res.status(400).json({ detail: 'newName must be 1-255 characters' });
  }

  const node = resolvePath(req.user.id, pathStr);
  if (!node) return res.status(404).json({ detail: 'Not found' });
  if (node.parent_id === null) return res.status(400).json({ detail: 'Cannot rename root' });

  const conflict = db.prepare(
    'SELECT id FROM fs_nodes WHERE user_id = ? AND parent_id = ? AND name = ?'
  ).get(req.user.id, node.parent_id, newName);
  if (conflict) return res.status(409).json({ detail: 'Name already exists' });

  db.prepare(
    "UPDATE fs_nodes SET name = ?, modified_at = datetime('now') WHERE id = ?"
  ).run(newName, node.id);

  res.json({ ok: true });
});

// GET /api/fs/exists?path=...
router.get('/exists', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const node = resolvePath(req.user.id, pathStr);
  res.json({ exists: node !== null && node !== undefined });
});

// GET /api/fs/node-type?path=...
router.get('/node-type', (req, res) => {
  const pathStr = req.query.path;
  if (!pathStr) return res.status(400).json({ detail: 'path query parameter is required' });

  const node = resolvePath(req.user.id, pathStr);
  res.json({ type: node ? node.node_type : null });
});

module.exports = router;
