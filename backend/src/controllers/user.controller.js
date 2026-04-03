const userService = require('../services/user.service');
const { success } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');
const { HTTP_STATUS_CREATED } = require('../utils/constants');

const list = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;
  const result = userService.listUsersPaginated({ page, limit });
  res.status(200).json(success(result));
});

const getOne = asyncHandler(async (req, res) => {
  const user = userService.getUserById(req.params.id);
  res.status(200).json(success({ user }));
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUserAdmin(req.validatedBody);
  res.status(HTTP_STATUS_CREATED).json(success({ user }));
});

const update = asyncHandler(async (req, res) => {
  const user = userService.updateUserAdmin(req.params.id, req.validatedBody);
  res.status(200).json(success({ user }));
});

const remove = asyncHandler(async (req, res) => {
  const user = userService.deactivateUser(req.params.id);
  res.status(200).json(success({ user }));
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};
