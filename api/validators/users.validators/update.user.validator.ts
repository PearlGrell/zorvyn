import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { Role, Status } from "../../../generated/prisma/client";

const updateUserSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(Status).optional(),
    password: z.string()
        .min(6)
        .max(12)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ).optional(),
});

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        updateUserSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}
