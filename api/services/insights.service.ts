import prisma from "../config/prisma.config";
import { TransactionType } from "../../generated/prisma/client";

export async function getCategorySpending(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
        createdBy: userId,
        type: TransactionType.EXPENSE,
    };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const rawData = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: {
            amount: true
        }
    });

    const categories = await prisma.transactionCategory.findMany({
        where: {
            id: {
                in: rawData.map(item => item.categoryId)
            }
        }
    });

    return rawData.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        return {
            categoryName: category?.name || 'Unknown',
            totalAmount: item._sum.amount || 0
        };
    });
}

export async function getMonthlySummary(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
        createdBy: userId,
    };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const income = await prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true }
    });

    const expense = await prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true }
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expense._sum.amount || 0;

    return {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses
    };
}

export async function getRecentTrends(userId: string, startDate?: string, endDate?: string) {
    const where: any = {
        createdBy: userId,
    };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: {
            date: 'asc'
        }
    });

    const trends: Record<string, { income: number, expense: number }> = {};

    transactions.forEach(tx => {
        const month = tx.date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!trends[month]) {
            trends[month] = { income: 0, expense: 0 };
        }
        if (tx.type === TransactionType.INCOME) {
            trends[month].income += tx.amount;
        } else {
            trends[month].expense += tx.amount;
        }
    });

    return Object.entries(trends).map(([month, data]) => ({
        month,
        ...data
    }));
}
