import type { Request, Response, NextFunction, CookieOptions } from "express";
import { mock } from "bun:test";

export const mockRequest = (overrides: Partial<Request> = {}): Request => {
    return {
        body: {},
        query: {},
        params: {},
        header: mock((name: string) => undefined),
        headers: {},
        cookies: {},
        user: undefined,
        ...overrides,
    } as unknown as Request;
};

export const mockResponse = (): Response => {
    const res: Partial<Response> = {};
    res.status = mock((code: number) => res as Response);
    res.json = mock((data: any) => res as Response);
    res.send = mock((data: any) => res as Response);
    res.cookie = mock((name: string, value: any, options?: any) => res as Response);
    res.clearCookie = mock((name: string, options?: any) => res as Response);
    res.end = mock(() => res as Response);
    return res as Response;
};

export const mockNext = (): NextFunction => mock(() => {}) as unknown as NextFunction;
