const { Router } = require('express');
const db = require('../db');
const { hashPassword, verifyPassword, setTokenCookie, COOKIE_NAME } = require('../auth');
const { requireAuth } = require('../middleware');

const router = Router();

const DEFAULT_DIRS = ['Documents', 'Desktop', 'Pictures', 'Games', 'Music'];

const seedUserData = db.transaction((userId) => {
  // Create default settings
  db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);

  // Create root directory
  const { lastInsertRowid: rootId } = db.prepare(
    "INSERT INTO fs_nodes (user_id, parent_id, name, node_type) VALUES (?, NULL, '/', 'directory')"
  ).run(userId);

  // Create default directories
  const insertDir = db.prepare(
    "INSERT INTO fs_nodes (user_id, parent_id, name, node_type) VALUES (?, ?, ?, 'directory')"
  );
  for (const dir of DEFAULT_DIRS) {
    insertDir.run(userId, rootId, dir);
  }
});

function userResponse(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
  };
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || username.length < 1 || username.length > 64) {
    return res.status(400).json({ detail: 'Username must be 1-64 characters' });
  }
  if (!password || password.length < 4 || password.length > 128) {
    return res.status(400).json({ detail: 'Password must be 4-128 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ detail: 'Username already taken' });
  }

  const hash = hashPassword(password);
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, hash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);

  seedUserData(user.id);
  setTokenCookie(res, user.id, '7d');

  res.status(201).json(userResponse(user));
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password, sessionDuration = '7d' } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid username or password' });
  }

  setTokenCookie(res, user.id, sessionDuration);

  res.json(userResponse(user));
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/api' });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(userResponse(req.user));
});

module.exports = router;
