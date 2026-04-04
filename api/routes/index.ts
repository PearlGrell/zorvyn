import { Router } from "express";
import auth from "./auth.route";
import user from "./users.route";
import transaction from "./transactions.route";
import category from "./categories.route";
import dashboard from "./dashboard.route";
import insights from "./insights.route";
import audit from "./audit.route";

const router = Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/transactions", transaction);
router.use("/categories", category);
router.use("/dashboard", dashboard);
router.use("/insights", insights);
router.use("/admin/audit", audit);

export default router;