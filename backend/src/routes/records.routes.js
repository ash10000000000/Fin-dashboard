const express = require('express');
const recordController = require('../controllers/record.controller');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');
const { validateBody, validateQuery } = require('../middleware/validateRequest');
const { createRecordSchema, updateRecordSchema } = require('../validators/record.validator');
const { recordsListQuerySchema } = require('../validators/recordsQuery.validator');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /records:
 *   get:
 *     summary: List financial records with pagination and filters
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date, example: '2024-01-01' }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: LIKE match on category and notes
 *     responses:
 *       200:
 *         description: Paginated list (soft-deleted excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data: { type: array, items: { type: object } }
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
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
  '/',
  requireRole(USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  validateQuery(recordsListQuerySchema),
  recordController.list
);

/**
 * @openapi
 * /records/{id}:
 *   get:
 *     summary: Get a single financial record
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Record found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     record: { type: object }
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
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.get(
  '/:id',
  requireRole(USER_ROLES.VIEWER, USER_ROLES.ANALYST, USER_ROLES.ADMIN),
  recordController.getOne
);

/**
 * @openapi
 * /records:
 *   post:
 *     summary: Create a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: number, exclusiveMinimum: 0 }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *               date: { type: string, example: '2024-06-01' }
 *               notes: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Created
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
router.post(
  '/',
  requireRole(USER_ROLES.ADMIN),
  validateBody(createRecordSchema),
  recordController.create
);

/**
 * @openapi
 * /records/{id}:
 *   patch:
 *     summary: Update a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number, exclusiveMinimum: 0 }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *               date: { type: string }
 *               notes: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated
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
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.patch(
  '/:id',
  requireRole(USER_ROLES.ADMIN),
  validateBody(updateRecordSchema),
  recordController.update
);

/**
 * @openapi
 * /records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record (admin only)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: deleted_at set
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
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       429:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TooManyRequests'
 */
router.delete('/:id', requireRole(USER_ROLES.ADMIN), recordController.remove);

module.exports = router;
