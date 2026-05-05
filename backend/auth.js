const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('SECRET_KEY env var is required in production');
}
if (!SECRET_KEY) {
  console.warn('SECRET_KEY not set — using ephemeral dev key (sessions reset on restart)');
}
const EFFECTIVE_KEY = SECRET_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'HS256';
const COOKIE_NAME = 'retroos_token';

const SESSION_DURATIONS = {
  session: null,
  '7d': 7 * 86400,
  '30d': 30 * 86400,
  never: 10 * 365 * 86400,
};

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

function createAccessToken(userId, duration = '7d') {
  const maxAge = SESSION_DURATIONS.hasOwnProperty(duration)
    ? SESSION_DURATIONS[duration]
    : 7 * 86400;
  const expireSeconds = maxAge !== null ? maxAge : 7 * 86400;
  const token = jwt.sign({ sub: String(userId) }, EFFECTIVE_KEY, {
    algorithm: ALGORITHM,
    expiresIn: expireSeconds,
  });
  return { token, maxAge };
}

function decodeToken(token) {
  try {
    const payload = jwt.verify(token, EFFECTIVE_KEY, { algorithms: [ALGORITHM] });
    return parseInt(payload.sub, 10);
  } catch {
    return null;
  }
}

function setTokenCookie(res, userId, duration = '7d') {
  const { token, maxAge } = createAccessToken(userId, duration);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
  };
  if (maxAge !== null) {
    options.maxAge = maxAge * 1000;
  }
  res.cookie(COOKIE_NAME, token, options);
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  createAccessToken,
  decodeToken,
  setTokenCookie,
};
