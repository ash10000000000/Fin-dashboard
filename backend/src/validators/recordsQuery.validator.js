const { z } = require('zod');
const { RECORD_TYPES, ISO_DATE_LENGTH } = require('../utils/constants');
const { paginationQuerySchema } = require('./pagination.validator');

function emptyQueryToUndefined(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
}

const recordsListQuerySchema = paginationQuerySchema.extend({
  type: z.preprocess(
    emptyQueryToUndefined,
    z.enum([RECORD_TYPES.INCOME, RECORD_TYPES.EXPENSE]).optional()
  ),
  category: z.preprocess(emptyQueryToUndefined, z.string().min(1).optional()),
  date_from: z.preprocess(
    emptyQueryToUndefined,
    z
      .string()
      .length(ISO_DATE_LENGTH)
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
  ),
  date_to: z.preprocess(
    emptyQueryToUndefined,
    z
      .string()
      .length(ISO_DATE_LENGTH)
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
  ),
  search: z.preprocess(emptyQueryToUndefined, z.string().optional()),
});

module.exports = {
  recordsListQuerySchema,
};
