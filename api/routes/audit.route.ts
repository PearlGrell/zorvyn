import { Router } from "express";
import * as auditController from "../controllers/audit.controller";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import getAllAuditLogsValidator from "../validators/audit.validators/get-all.audit.validator";

const audit = Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: System audit logs (Admin only)
 */

/**
 * @swagger
 * /admin/audit:
 *   get:
 *     summary: Get system audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved
 */
audit.get("/", authMiddleware, checkPermission(Permission.MANAGE_USERS), getAllAuditLogsValidator, auditController.getAuditLogs);

export default audit;
