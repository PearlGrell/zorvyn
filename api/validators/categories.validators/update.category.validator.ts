import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

const updateCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters")
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        updateCategorySchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}
