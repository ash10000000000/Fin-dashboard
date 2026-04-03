const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');
const { validateQuery } = require('../middleware/validateRequest');
const { trendsQuerySchema } = require('../validators/dashboard.validator');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     summary: Dashboard totals and recent activity
 *     description: Analyst and admin only.
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Summary payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome: { type: number }
 *                     totalExpenses: { type: number }
 *                     netBalance: { type: number }
 *                     totalRecords: { type: integer }
 *                     recentActivity: { type: array, items: { type: object } }
 *       401:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forbidden'
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.get(
  '/summary',
  requireRole(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  dashboardController.summary
);

/**
 * @openapi
 * /dashboard/categories:
 *   get:
 *     summary: Category-wise totals grouped by type
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of category breakdown rows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category: { type: string }
 *                       total: { type: number }
 *                       type: { type: string, enum: [income, expense] }
 *       401:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forbidden'
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.get(
  '/categories',
  requireRole(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  dashboardController.categories
);

/**
 * @openapi
 * /dashboard/trends:
 *   get:
 *     summary: Income vs expenses trends
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 *         description: monthly = last 6 months, weekly = last 6 weeks
 *     responses:
 *       200:
 *         description: Trend buckets with label, income, expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label: { type: string }
 *                       income: { type: number }
 *                       expenses: { type: number }
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       403:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forbidden'
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.get(
  '/trends',
  requireRole(USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  validateQuery(trendsQuerySchema),
  dashboardController.trends
);

module.exports = router;
