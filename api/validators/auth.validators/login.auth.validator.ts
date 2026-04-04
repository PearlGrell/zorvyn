import z from "zod";
import type { NextFunction, Request, Response } from "express";

const loginSchema = z.object({
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
        loginSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}