const db = require('./db');
const { COOKIE_NAME, decodeToken } = require('./auth');

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  const userId = decodeToken(token);
  if (userId === null) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(401).json({ detail: 'User not found' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
