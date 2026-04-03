const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');

const summary = asyncHandler(async (req, res) => {
  const data = dashboardService.getSummary();
  res.status(200).json(success(data));
});

const categories = asyncHandler(async (req, res) => {
  const data = dashboardService.getCategories();
  res.status(200).json(success(data));
});

const trends = asyncHandler(async (req, res) => {
  const { period } = req.validatedQuery;
  const data = dashboardService.getTrends(period);
  res.status(200).json(success(data));
});

module.exports = {
  summary,
  categories,
  trends,
};
