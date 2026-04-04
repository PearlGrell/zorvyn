import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller";
import createCategoryValidator from "../validators/categories.validators/create.category.validator";
import updateCategoryValidator from "../validators/categories.validators/update.category.validator";
import getAllCategoriesValidator from "../validators/categories.validators/get-all.categories.validator";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";

const category = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management for transactions
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories retrieved
 */
category.get('/', authMiddleware, checkPermission(Permission.READ_RECORDS), getAllCategoriesValidator, categoriesController.getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
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
 *         description: Category details retrieved
 */
category.get('/:id', authMiddleware, checkPermission(Permission.READ_RECORDS), categoriesController.getCategoryById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       201:
 *         description: Category created
 */
category.post('/', authMiddleware, checkPermission(Permission.CREATE_RECORDS), createCategoryValidator, categoriesController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Category updated
 */
category.patch('/:id', authMiddleware, checkPermission(Permission.UPDATE_RECORDS), updateCategoryValidator, categoriesController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
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
 *         description: Category deleted
 */
category.delete('/:id', authMiddleware, checkPermission(Permission.DELETE_RECORDS), categoriesController.deleteCategory);

export default category;