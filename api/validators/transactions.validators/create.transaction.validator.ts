import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { TransactionType } from "../../../generated/prisma/client";

const createTransactionSchema = z.object({
    amount: z.number().positive("Amount must be a positive number"),
    type: z.nativeEnum(TransactionType),
    categoryId: z.string().min(1, "Category is required"),
    date: z.string().datetime("Invalid ISO date format"),
    notes: z.string().max(255).optional(),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body.amount === 'string') {
            req.body.amount = parseFloat(req.body.amount);
        }
        createTransactionSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}
