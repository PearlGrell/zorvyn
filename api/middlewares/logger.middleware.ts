import type { NextFunction, Request, Response } from "express";

export default function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`);
    next();
}