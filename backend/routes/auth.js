const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { hashPassword, verifyPassword, setTokenCookie, COOKIE_NAME } = require('../auth');
const { requireAuth } = require('../middleware');

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many login attempts. Please wait a few minutes and try again.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many accounts created from this IP. Please try again later.' },
});

const DEFAULT_DIRS = ['Documents', 'Desktop', 'Pictures', 'Games', 'Music'];

const seedUserData = db.transaction((userId) => {

  db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);

  const { lastInsertRowid: rootId } = db.prepare(
    "INSERT INTO fs_nodes (user_id, parent_id, name, node_type) VALUES (?, NULL, '/', 'directory')"
  ).run(userId);

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

router.post('/register', registerLimiter, (req, res) => {
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

router.post('/login', loginLimiter, (req, res) => {
  const { username, password, sessionDuration = '7d' } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid username or password' });
  }

  setTokenCookie(res, user.id, sessionDuration);

  res.json(userResponse(user));
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/api' });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(userResponse(req.user));
});

module.exports = router;
