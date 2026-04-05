import type { NextFunction, Request, Response } from "express";
import * as transactionsService from "../services/transactions.service";
import statusCodes from "../constants/status_codes";
import { AppError } from "../utils/error.util";
import { Prisma, TransactionType } from "../../generated/prisma/client";

export async function getAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
        const { 
            search,
            type, 
            categoryId, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount, 
            sortBy, 
            sortOrder, 
            limit, 
            cursor 
        } = req.query as transactionsService.TransactionQueryParams;

        const results = await transactionsService.findAll({
            search,
            type,
            categoryId,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            sortBy,
            sortOrder,
            limit,
            cursor,
            userId: req.user?.id
        });

        res.status(statusCodes.OK).json({ 
            transactions: results.transactions,
            pagination: {
                nextCursor: results.nextCursor
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const transaction = await transactionsService.findById(id);

        if (!transaction) {
            throw new AppError("Transaction not found", statusCodes.NOT_FOUND);
        }

        res.status(statusCodes.OK).json({ transaction });
    } catch (error) {
        next(error);
    }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const { amount, type, categoryId, date, notes } = req.body;
        
        if (!req.user?.id) {
            throw new AppError("Authentication required", statusCodes.UNAUTHORIZED);
        }

        const transaction = await transactionsService.create({
            amount: parseFloat(amount),
            type: type as TransactionType,
            categoryId,
            date: new Date(date),
            notes,
            createdBy: req.user.id
        });

        res.status(statusCodes.CREATED).json({ transaction });
    } catch (error) {
        next(error);
    }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { amount, type, categoryId, date, notes } = req.body;

        const updateData: Prisma.TransactionUncheckedUpdateInput = {
            amount: amount ? parseFloat(amount) : undefined,
            type: type as TransactionType,
            categoryId,
            date: date ? new Date(date) : undefined,
            notes
        };

        Object.keys(updateData).forEach(key => (updateData as Record<string, unknown>)[key] === undefined && delete (updateData as Record<string, unknown>)[key]);

        const transaction = await transactionsService.update(id, updateData, req.user?.id!);
        res.status(statusCodes.OK).json({ transaction });
    } catch (error) {
        next(error);
    }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const transaction = await transactionsService.deleteTransaction(id, req.user?.id!);
        res.status(statusCodes.OK).json({ transaction });
    } catch (error) {
        next(error);
    }
}
