import type { NextFunction, Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import statusCodes from "../constants/status_codes";

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
        const summary = await dashboardService.getSummary();
        const categoryBreakdown = await dashboardService.getCategoryBreakdown();
        const recentActivity = await dashboardService.getRecentActivity();
        const trends = await dashboardService.getTrends();

        res.status(statusCodes.OK).json({ 
            summary,
            categoryBreakdown,
            recentActivity,
            trends
        });
    } catch (error) {
        next(error);
    }
}
