const recordService = require('../services/record.service');
const { success } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');
const { HTTP_STATUS_CREATED } = require('../utils/constants');

const list = asyncHandler(async (req, res) => {
  const { page, limit, type, category, date_from, date_to, search } = req.validatedQuery;
  const filters = {};
  if (type) filters.type = type;
  if (category) filters.category = category;
  if (date_from) filters.date_from = date_from;
  if (date_to) filters.date_to = date_to;
  if (search) filters.search = search;
  const result = recordService.listRecordsPaginated({ page, limit, filters });
  res.status(200).json(success(result));
});

const getOne = asyncHandler(async (req, res) => {
  const record = recordService.getRecordById(req.params.id);
  res.status(200).json(success({ record }));
});

const create = asyncHandler(async (req, res) => {
  const record = recordService.createRecord(req.validatedBody, req.user.id);
  res.status(HTTP_STATUS_CREATED).json(success({ record }));
});

const update = asyncHandler(async (req, res) => {
  const record = recordService.updateRecord(req.params.id, req.validatedBody);
  res.status(200).json(success({ record }));
});

const remove = asyncHandler(async (req, res) => {
  const result = recordService.softDeleteRecord(req.params.id);
  res.status(200).json(success(result));
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};
