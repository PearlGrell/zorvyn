import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import getAllUsersValidator from "../validators/users.validators/get-all.users.validator";
import createUserValidator from "../validators/users.validators/create.user.validator";
import updateUserValidator from "../validators/users.validators/update.user.validator";

const user = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
user.get('/me', authMiddleware, usersController.getMe);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile deleted
 */
user.delete('/me', authMiddleware, checkPermission(Permission.READ_RECORDS), usersController.deleteMe);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
user.get('/', authMiddleware, checkPermission(Permission.MANAGE_USERS), getAllUsersValidator, usersController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
user.get('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), usersController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
user.post('/', authMiddleware, checkPermission(Permission.MANAGE_USERS), createUserValidator, usersController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
user.patch('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), updateUserValidator, usersController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
user.delete('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), usersController.deleteUser);

export default user;