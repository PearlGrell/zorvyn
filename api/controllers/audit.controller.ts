import type { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.config";
import statusCodes from "../constants/status_codes";
import type { AuditLogQueryParams } from "../validators/audit.validators/get-all.audit.validator";

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const { 
            userId, 
            action, 
            entity, 
            startDate, 
            endDate, 
            limit, 
            cursor 
        } = req.query as unknown as AuditLogQueryParams;

        const where: any = {};
        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entity) where.entity = entity;

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        const query: any = {
            where,
            orderBy: {
                timestamp: 'desc'
            },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        };

        if (cursor) {
            query.cursor = { id: cursor };
            query.skip = 1;
        }

        const logs = await prisma.auditLogs.findMany(query);

        const nextCursor = (logs.length > 0 && logs.length === limit)
            ? logs[logs.length - 1]?.id
            : null;

        res.status(statusCodes.OK).json({
            logs,
            pagination: {
                nextCursor
            }
        });
    } catch (error) {
        next(error);
    }
}
