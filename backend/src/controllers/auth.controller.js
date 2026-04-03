const authService = require('../services/auth.service');
const { success } = require('../utils/response');
const { signToken, buildCookieOptions, clearAuthCookieOptions } = require('../utils/token');
const { COOKIE_NAME, HTTP_STATUS_CREATED } = require('../utils/constants');
const { asyncHandler } = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.validatedBody);
  res.status(HTTP_STATUS_CREATED).json(success({ user }));
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.validatedBody);
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  res.cookie(COOKIE_NAME, token, buildCookieOptions());
  res.status(200).json(success({ user }));
});

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, clearAuthCookieOptions());
  res.status(200).json(success({ message: 'Logged out' }));
};

const me = asyncHandler(async (req, res) => {
  const user = authService.getProfile(req.user.id);
  res.status(200).json(success({ user }));
});

module.exports = {
  register,
  login,
  logout,
  me,
};
