import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

const getAllUsersSchema = z.object({
    search: z.string().optional(),
    sortBy: z.enum(['name', 'email', 'role', 'status', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    limit: z.preprocess((v) => (v ? parseInt(v as string, 10) : 10), z.number().min(1).max(100)).optional(),
    cursor: z.string().optional(),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = getAllUsersSchema.parse(req.query);
        req.query = validated as unknown as typeof req.query;
        next();
    } catch (error) {
        next(error);
    }
}
