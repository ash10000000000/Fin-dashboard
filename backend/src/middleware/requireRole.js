function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      const e = new Error('Unauthorized');
      e.status = 401;
      return next(e);
    }
    if (!allowedRoles.includes(req.user.role)) {
      const e = new Error('Forbidden');
      e.status = 403;
      return next(e);
    }
    return next();
  };
}

module.exports = { requireRole };
