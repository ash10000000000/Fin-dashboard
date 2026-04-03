const { verifyToken } = require('../utils/token');
const { COOKIE_NAME } = require('../utils/constants');

function authenticate(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    const unauthorized = new Error('Unauthorized');
    unauthorized.status = 401;
    return next(unauthorized);
  }
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    const unauthorized = new Error('Unauthorized');
    unauthorized.status = 401;
    return next(unauthorized);
  }
}

module.exports = { authenticate };
