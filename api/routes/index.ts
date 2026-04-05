import { Router } from "express";
import auth from "./auth.route";
import user from "./users.route";
import transaction from "./transactions.route";
import category from "./categories.route";
import dashboard from "./dashboard.route";
import insights from "./insights.route";
import audit from "./audit.route";
import prisma from "../config/prisma.config";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.config';
    
const router = Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/transactions", transaction);
router.use("/categories", category);
router.use("/dashboard", dashboard);
router.use("/insights", insights);
router.use("/admin/audit", audit);

router.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', message: (error as Error).message });
    }
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;