const { z } = require('zod');
const { USER_STATUSES } = require('../utils/constants');
const { userRoleEnum } = require('./auth.validator');

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleEnum,
});

const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    role: userRoleEnum.optional(),
    status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.INACTIVE]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
    path: ['root'],
  });

module.exports = {
  createUserSchema,
  updateUserSchema,
};
