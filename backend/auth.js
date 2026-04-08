const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'dev-secret-change-me-in-production';
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
  const token = jwt.sign({ sub: String(userId) }, SECRET_KEY, {
    algorithm: ALGORITHM,
    expiresIn: expireSeconds,
  });
  return { token, maxAge };
}

function decodeToken(token) {
  try {
    const payload = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
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
    options.maxAge = maxAge * 1000; // Express uses milliseconds
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
