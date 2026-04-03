const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');
const { validateBody, validateQuery } = require('../middleware/validateRequest');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');
const { paginationQuerySchema } = require('../validators/pagination.validator');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);
router.use(requireRole(USER_ROLES.ADMIN));

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Paginated list of users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated users (no passwords)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data: { type: array }
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
router.get('/', validateQuery(paginationQuerySchema), userController.list);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User
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
router.get('/:id', userController.getOne);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create user with role
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [viewer, analyst, admin] }
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
 *       409:
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
router.post('/', validateBody(createUserSchema), userController.create);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update user name, role, or status
 *     tags: [Users]
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
 *               name: { type: string }
 *               role: { type: string, enum: [viewer, analyst, admin] }
 *               status: { type: string, enum: [active, inactive] }
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
router.patch('/:id', validateBody(updateUserSchema), userController.update);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Deactivate user (sets status inactive)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deactivated
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
router.delete('/:id', userController.remove);

module.exports = router;
