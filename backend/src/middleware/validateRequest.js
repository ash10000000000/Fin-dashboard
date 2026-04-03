function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(parsed.error);
    }
    req.validatedBody = parsed.data;
    return next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(parsed.error);
    }
    req.validatedQuery = parsed.data;
    return next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
};
