import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as dashboardController from "../controllers/dashboard.controller";

const dashboard = Router();

dashboard.get('/', authMiddleware, checkPermission(Permission.VIEW_DASHBOARD), dashboardController.getDashboardSummary);

export default dashboard;