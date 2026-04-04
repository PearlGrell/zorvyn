import { Router } from "express";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import * as dashboardController from "../controllers/dashboard.controller";

const dashboard = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: High-level financial overview
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved
 */
dashboard.get('/', authMiddleware, checkPermission(Permission.VIEW_DASHBOARD), dashboardController.getDashboardSummary);

export default dashboard;