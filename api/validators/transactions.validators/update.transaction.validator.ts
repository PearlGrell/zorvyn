import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { TransactionType } from "../../../generated/prisma/client";

const updateTransactionSchema = z.object({
    amount: z.number().positive("Amount must be a positive number").optional(),
    type: z.nativeEnum(TransactionType).optional(),
    categoryId: z.string().min(1, "Category is required").optional(),
    date: z.string().datetime("Invalid ISO date format").optional(),
    notes: z.string().max(255).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.amount && typeof req.body.amount === 'string') {
            req.body.amount = parseFloat(req.body.amount);
        }
        updateTransactionSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}
