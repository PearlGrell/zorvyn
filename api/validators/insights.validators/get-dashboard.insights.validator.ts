import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

const getDashboardInsightsSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = getDashboardInsightsSchema.parse(req.query);
        req.query = validated as any;
        next();
    } catch (error) {
        next(error);
    }
}
