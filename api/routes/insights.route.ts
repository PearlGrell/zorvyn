import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as insightsController from "../controllers/insights.controller";
import dashboardInsightsValidator from "../validators/insights.validators/get-dashboard.insights.validator";

const insights = Router();

/**
 * @swagger
 * tags:
 *   name: Insights
 *   description: Financial insights and trends
 */

/**
 * @swagger
 * /insights:
 *   get:
 *     summary: Get dashboard insights
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [WEEKLY, MONTHLY, YEARLY]
 *           default: MONTHLY
 *     responses:
 *       200:
 *         description: Insights retrieved
 */
insights.get('/', 
    authMiddleware, 
    checkPermission(Permission.VIEW_INSIGHTS), 
    dashboardInsightsValidator,
    insightsController.getDashboardInsights
);

export default insights;
