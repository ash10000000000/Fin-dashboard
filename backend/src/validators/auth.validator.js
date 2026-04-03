const { z } = require('zod');
const { USER_ROLES } = require('../utils/constants');

const registerBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginBodySchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const userRoleEnum = z.enum([USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN]);

module.exports = {
  registerBodySchema,
  loginBodySchema,
  userRoleEnum,
};
