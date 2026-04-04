import type { NextFunction, Request, Response } from "express";
import { findById } from "../services/auth.service";
import statusCodes from "../constants/status_codes";
import jwtUtil from "../utils/jwt.util";
import type { User } from "../../generated/prisma/client";
import environmentConfig from "../config/environment.config";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Authorization header is required" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Token is required" });
    }

    const decoded = jwtUtil.validateAccessToken(token);

    if (!decoded) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: "Token is invalid" });
    }

    const user = await findById(decoded.userId);

    if (!user || user.status === "DELETED" || user.status === "INACTIVE") {
      return res.status(statusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    req.user = user;
    next();

  } catch (err) {
    if (environmentConfig.ENV === "development") {
      console.error(err);
    }
    return res.status(statusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
  }
}