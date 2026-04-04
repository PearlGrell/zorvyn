import prisma from "../config/prisma.config";
import { TransactionType } from "../../generated/prisma/client";

export async function getSummary() {
    const aggregates = await prisma.transaction.aggregate({
        _sum: {
            amount: true
        }
    });

    const income = await prisma.transaction.aggregate({
        where: { type: TransactionType.INCOME },
        _sum: { amount: true }
    });

    const expense = await prisma.transaction.aggregate({
        where: { type: TransactionType.EXPENSE },
        _sum: { amount: true }
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expense._sum.amount || 0;
    
    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses
    };
}

export async function getCategoryBreakdown() {
    const rawData = await prisma.transaction.groupBy({
        by: ['categoryId'],
        _sum: {
            amount: true
        }
    });

    const categories = await prisma.transactionCategory.findMany();

    return rawData.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        return {
            categoryName: category?.name || 'Unknown',
            totalAmount: item._sum.amount || 0
        };
    });
}

export async function getRecentActivity() {
    return await prisma.transaction.findMany({
        take: 10,
        orderBy: {
            date: 'desc'
        },
        include: {
            category: true,
            user: {
                select: {
                    name: true
                }
            }
        }
    });
}

export async function getTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                gte: sixMonthsAgo
            }
        },
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

    return trends;
}
