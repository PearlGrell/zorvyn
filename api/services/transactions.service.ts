import prisma from "../config/prisma.config";
import { Prisma, TransactionType, type Transaction } from "../../generated/prisma/client";
import { audit } from "./audit.service";

export interface TransactionQueryParams {
    type?: TransactionType;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: 'date' | 'amount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string;
    userId?: string;
    search?: string;
}

export interface TransactionPaginatedResponse {
    transactions: Transaction[];
    nextCursor?: string | null;
}

export async function findAll(params: TransactionQueryParams = {}): Promise<TransactionPaginatedResponse> {
    const {
        type,
        categoryId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy = 'date',
        sortOrder = 'desc',
        limit = 10,
        cursor,
        userId,
        search,
    } = params;

    const where: Prisma.TransactionWhereInput = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (userId) where.createdBy = userId;

    if (search) {
        where.OR = [
            { notes: { contains: search } },
            { category: { name: { contains: search } } }
        ];
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
        where.amount = {};
        if (minAmount !== undefined) where.amount.gte = minAmount;
        if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    const query: Prisma.TransactionFindManyArgs = {
        where,
        include: {
            category: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
        take: limit,
    };

    if (cursor) {
        query.cursor = { id: cursor };
        query.skip = 1;
    }

    const transactions = await prisma.transaction.findMany(query);

    const nextCursor = (transactions.length > 0 && transactions.length === limit)
        ? transactions[transactions.length - 1]?.id
        : null;

    return {
        transactions,
        nextCursor,
    };
}

export async function findById(id: string): Promise<Transaction | null> {
    return await prisma.transaction.findUnique({
        where: { id },
        include: { category: true, user: true }
    });
}

export async function create(data: { amount: number; type: TransactionType; categoryId: string; date: Date; notes?: string; createdBy: string }): Promise<Transaction> {
    const transaction = await prisma.transaction.create({
        data,
        include: { category: true }
    });

    await audit(data.createdBy, "CREATE_TRANSACTION", "Transaction", transaction.id);
    return transaction;
}

export async function update(id: string, data: Prisma.TransactionUncheckedUpdateInput, performingUserId: string): Promise<Transaction> {
    const transaction = await prisma.transaction.update({
        where: { id },
        data,
        include: { category: true }
    });

    await audit(performingUserId, "UPDATE_TRANSACTION", "Transaction", id);
    return transaction;
}

export async function deleteTransaction(id: string, performingUserId: string): Promise<Transaction> {
    const transaction = await prisma.transaction.delete({
        where: { id },
    });

    await audit(performingUserId, "DELETE_TRANSACTION", "Transaction", id);
    return transaction;
}
