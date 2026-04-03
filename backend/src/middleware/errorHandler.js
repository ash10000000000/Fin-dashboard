const { ZodError } = require('zod');
const { zodToFieldErrors } = require('../utils/response');

function errorHandler(err, req, res, _next) {
  const requestId = req.requestId;
  if (err instanceof ZodError) {
    const body = zodToFieldErrors(err);
    return res.status(400).json({ ...body, requestId });
  }
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    requestId,
  });
}

module.exports = { errorHandler };
