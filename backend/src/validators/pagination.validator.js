const { z } = require('zod');
const {
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} = require('../utils/constants');

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_MAX_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
});

module.exports = {
  paginationQuerySchema,
};
