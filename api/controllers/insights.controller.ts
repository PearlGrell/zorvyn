import type { NextFunction, Request, Response } from "express";
import * as insightsService from "../services/insights.service";
import statusCodes from "../constants/status_codes";

export async function getDashboardInsights(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.id;
        const { startDate, endDate } = req.query as any;

        const [categorySpending, monthlySummary, recentTrends] = await Promise.all([
            insightsService.getCategorySpending(userId, startDate, endDate),
            insightsService.getMonthlySummary(userId, startDate, endDate),
            insightsService.getRecentTrends(userId, startDate, endDate),
        ]);

        res.status(statusCodes.OK).json({
            categorySpending,
            monthlySummary,
            recentTrends,
        });
    } catch (error) {
        next(error);
    }
}
