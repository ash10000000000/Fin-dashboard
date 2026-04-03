const rateLimit = require('express-rate-limit');
const {
  RATE_LIMIT_GLOBAL_WINDOW_MS,
  RATE_LIMIT_GLOBAL_MAX,
  RATE_LIMIT_LOGIN_WINDOW_MS,
  RATE_LIMIT_LOGIN_MAX,
  RATE_LIMIT_ERROR_MESSAGE,
  HTTP_STATUS_TOO_MANY_REQUESTS,
} = require('../utils/constants');

const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_GLOBAL_WINDOW_MS,
  limit: RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS_TOO_MANY_REQUESTS).json({
      success: false,
      message: RATE_LIMIT_ERROR_MESSAGE,
      requestId: req.requestId,
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_LOGIN_WINDOW_MS,
  limit: RATE_LIMIT_LOGIN_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS_TOO_MANY_REQUESTS).json({
      success: false,
      message: RATE_LIMIT_ERROR_MESSAGE,
      requestId: req.requestId,
    });
  },
});

module.exports = {
  globalLimiter,
  loginLimiter,
};
