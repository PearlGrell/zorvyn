import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as insightsController from "../controllers/insights.controller";
import dashboardInsightsValidator from "../validators/insights.validators/get-dashboard.insights.validator";

const insights = Router();

insights.get('/', 
    authMiddleware, 
    checkPermission(Permission.VIEW_INSIGHTS), 
    dashboardInsightsValidator,
    insightsController.getDashboardInsights
);

export default insights;
