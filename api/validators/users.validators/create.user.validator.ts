import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { Role } from "../../../generated/prisma/client";

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .max(12, "Password must be at most 12 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
    role: z.nativeEnum(Role).optional().default(Role.VIEWER),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        createUserSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}
