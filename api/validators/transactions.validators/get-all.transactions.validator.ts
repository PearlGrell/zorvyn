import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { TransactionType } from "../../../generated/prisma/client";

const getAllTransactionsSchema = z.object({
    search: z.string().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minAmount: z.preprocess((v) => (v ? parseFloat(v as string) : undefined), z.number()).optional(),
    maxAmount: z.preprocess((v) => (v ? parseFloat(v as string) : undefined), z.number()).optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.preprocess((v) => (v ? parseInt(v as string, 10) : 10), z.number().min(1).max(100)).optional(),
    cursor: z.string().optional(),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = getAllTransactionsSchema.parse(req.query);
        req.query = validated as any;
        next();
    } catch (error) {
        next(error);
    }
}
