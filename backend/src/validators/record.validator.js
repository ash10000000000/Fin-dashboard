const { z } = require('zod');
const { RECORD_TYPES, ISO_DATE_LENGTH } = require('../utils/constants');

const isoDateSchema = z
  .string()
  .length(ISO_DATE_LENGTH, 'Date must be in YYYY-MM-DD format')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const recordTypeEnum = z.enum([RECORD_TYPES.INCOME, RECORD_TYPES.EXPENSE]);

const createRecordSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a positive number' })
    .positive('Amount must be a positive number'),
  type: recordTypeEnum,
  category: z.string().trim().min(1, 'Category cannot be empty'),
  date: isoDateSchema,
  notes: z.string().optional().nullable(),
});

const updateRecordSchema = z
  .object({
    amount: z
      .number({ invalid_type_error: 'Amount must be a positive number' })
      .positive('Amount must be a positive number')
      .optional(),
    type: recordTypeEnum.optional(),
    category: z.string().trim().min(1, 'Category cannot be empty').optional(),
    date: isoDateSchema.optional(),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
    path: ['root'],
  });

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordTypeEnum,
  isoDateSchema,
};
