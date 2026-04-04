import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as transactionsController from "../controllers/transactions.controller";
import getAllTransactionsValidator from "../validators/transactions.validators/get-all.transactions.validator";
import createTransactionValidator from "../validators/transactions.validators/create.transaction.validator";
import updateTransactionValidator from "../validators/transactions.validators/update.transaction.validator";


const transaction = Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Financial transaction management
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions retrieved
 */
transaction.get('/', authMiddleware, checkPermission(Permission.READ_RECORDS), getAllTransactionsValidator, transactionsController.getAllTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
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
 *         description: Transaction details retrieved
 */
transaction.get('/:id', authMiddleware, checkPermission(Permission.READ_RECORDS), transactionsController.getTransactionById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
transaction.post('/', authMiddleware, checkPermission(Permission.CREATE_RECORDS), createTransactionValidator, transactionsController.createTransaction);


/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Update a transaction
 *     tags: [Transactions]
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
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
transaction.patch('/:id', authMiddleware, checkPermission(Permission.UPDATE_RECORDS), updateTransactionValidator, transactionsController.updateTransaction);


/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted
 */
transaction.delete('/:id', authMiddleware, checkPermission(Permission.DELETE_RECORDS), transactionsController.deleteTransaction);

export default transaction;