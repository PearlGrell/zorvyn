import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AppError } from "../utils/error.util";
import { Prisma } from "../../generated/prisma/client";
import environmentConfig from "../config/environment.config";
import statusCodes from "../constants/status_codes";

export default function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) {
        return next(err);
    }

    const errorName = err instanceof Error ? err.name : 'Unknown';
    const errorMessage = err instanceof Error ? err.message : 'No message';
    const errorStack = err instanceof Error ? err.stack : undefined;

    if (environmentConfig.ENV === "development") {
        console.error(`[Error] ${errorName}: ${errorMessage}`);
        if (!(err instanceof AppError) && !(err instanceof ZodError)) {
            console.error(errorStack);
        }
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }

    if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message
        }));
        res.status(statusCodes.BAD_REQUEST).json({ success: false, message: "Validation Error", errors });
        return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[])?.join(', ') || 'field';
            res.status(statusCodes.CONFLICT).json({ success: false, message: `Duplicate entry for: ${target}` });
            return;
        }
        if (err.code === 'P2025') {
            res.status(statusCodes.NOT_FOUND).json({ success: false, message: "Record not found" });
            return;
        }
    }

    if (err instanceof JsonWebTokenError) {
        res.status(statusCodes.UNAUTHORIZED).json({ success: false, message: "Invalid token" });
        return;
    }

    if (err instanceof TokenExpiredError) {
        res.status(statusCodes.UNAUTHORIZED).json({ success: false, message: "Token expired" });
        return;
    }

    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
        ...(environmentConfig.ENV === "development" ? { error: errorMessage, stack: errorStack } : {}),
    });
}