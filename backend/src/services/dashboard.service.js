const recordModel = require('../models/record.model');
const { TREND_PERIOD_MONTHLY, TREND_PERIOD_WEEKLY } = require('../utils/constants');

function getSummary() {
  const totals = recordModel.getTotals();
  const recentActivity = recordModel.getRecentActivity();
  return {
    totalIncome: totals.totalIncome,
    totalExpenses: totals.totalExpenses,
    netBalance: totals.netBalance,
    totalRecords: totals.totalRecords,
    recentActivity,
  };
}

function getCategories() {
  const rows = recordModel.getCategoryBreakdown();
  return rows.map((r) => ({
    category: r.category,
    total: r.total,
    type: r.type,
  }));
}

function getTrends(period) {
  if (period === TREND_PERIOD_WEEKLY) {
    return recordModel.getWeeklyTrends();
  }
  return recordModel.getMonthlyTrends();
}

module.exports = {
  getSummary,
  getCategories,
  getTrends,
};
