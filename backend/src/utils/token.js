const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { JWT_EXPIRY_DAYS, MILLISECONDS_PER_DAY } = require('./constants');

function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${JWT_EXPIRY_DAYS}d`,
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function buildCookieOptions() {
  const maxAgeMs = JWT_EXPIRY_DAYS * MILLISECONDS_PER_DAY;
  const base = {
    httpOnly: true,
    maxAge: maxAgeMs,
    sameSite: 'lax',
    path: '/',
  };
  if (config.nodeEnv === 'production') {
    base.secure = true;
  }
  return base;
}

function clearAuthCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  };
}

module.exports = {
  signToken,
  verifyToken,
  buildCookieOptions,
  clearAuthCookieOptions,
};
