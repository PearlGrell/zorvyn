import { Router } from "express";
import loginValidator from "../validators/auth.validators/login.auth.validator";
import * as authController from "../controllers/auth.controller";
import registerValidator from "../validators/auth.validators/register.auth.validator";
import { authMiddleware } from "../middlewares/authenticate.middleware";

const auth = Router();

auth.get('/me', authMiddleware, authController.me);

auth.post('/login', loginValidator, authController.login);
auth.post('/register', registerValidator, authController.register);
auth.post('/refresh', authController.refresh);
auth.post('/logout', authMiddleware, authController.logout);

export default auth;