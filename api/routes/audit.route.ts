import { Router } from "express";
import * as auditController from "../controllers/audit.controller";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import getAllAuditLogsValidator from "../validators/audit.validators/get-all.audit.validator";

const audit = Router();

audit.get("/", authMiddleware, checkPermission(Permission.MANAGE_USERS), getAllAuditLogsValidator, auditController.getAuditLogs);

export default audit;
