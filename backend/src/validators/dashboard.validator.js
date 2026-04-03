const { z } = require('zod');
const { TREND_PERIOD_MONTHLY, TREND_PERIOD_WEEKLY } = require('../utils/constants');

const trendsQuerySchema = z.object({
  period: z
    .enum([TREND_PERIOD_MONTHLY, TREND_PERIOD_WEEKLY])
    .default(TREND_PERIOD_MONTHLY),
});

module.exports = {
  trendsQuerySchema,
};
