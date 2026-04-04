import z from "zod";
import type { NextFunction, Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .max(12, "Password must be at most 12 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        registerSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}   