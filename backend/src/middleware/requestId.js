const { randomUUID } = require('node:crypto');

function requestIdMiddleware(req, res, next) {
  const incoming = req.get('X-Request-ID');
  const id = incoming && incoming.length > 0 ? incoming : randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

module.exports = { requestIdMiddleware };
