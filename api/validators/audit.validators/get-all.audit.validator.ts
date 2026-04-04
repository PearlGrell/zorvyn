import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

const getAllAuditLogsSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.preprocess((v) => (v ? parseInt(v as string, 10) : 20), z.number().min(1).max(100)).optional().default(20),
  cursor: z.string().optional(),
});

export type AuditLogQueryParams = z.infer<typeof getAllAuditLogsSchema>;

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = getAllAuditLogsSchema.parse(req.query);
    req.query = validated as any;
    next();
  } catch (error) {
    next(error);
  }
};
