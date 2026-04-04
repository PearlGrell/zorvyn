import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as transactionsController from "../controllers/transactions.controller";
import getAllTransactionsValidator from "../validators/transactions.validators/get-all.transactions.validator";

const transaction = Router();

transaction.get('/', authMiddleware, checkPermission(Permission.READ_RECORDS), getAllTransactionsValidator, transactionsController.getAllTransactions);
transaction.get('/:id', authMiddleware, checkPermission(Permission.READ_RECORDS), transactionsController.getTransactionById);
transaction.post('/', authMiddleware, checkPermission(Permission.CREATE_RECORDS), transactionsController.createTransaction);
transaction.patch('/:id', authMiddleware, checkPermission(Permission.UPDATE_RECORDS), transactionsController.updateTransaction);
transaction.delete('/:id', authMiddleware, checkPermission(Permission.DELETE_RECORDS), transactionsController.deleteTransaction);

export default transaction;