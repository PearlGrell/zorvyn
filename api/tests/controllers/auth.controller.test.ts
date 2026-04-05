import { describe, it, expect, mock, beforeEach } from "bun:test";
import { login, register, refresh, logout } from "../../controllers/auth.controller";
import * as authService from "../../services/auth.service";
import * as auditService from "../../services/audit.service";
import hashUtil from "../../utils/hash.util";
import jwtUtil from "../../utils/jwt.util";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";
import { AppError } from "../../utils/error.util";
import { Status } from "../../../generated/prisma/enums";


mock.module("../../services/auth.service", () => ({
  create: mock(() => Promise.resolve({ id: "userid-1", name: "User" })),
  findByEmail: mock(() => Promise.resolve(null)),
  findById: mock(() => Promise.resolve(null)),
}));

mock.module("../../services/audit.service", () => ({
  audit: mock(() => Promise.resolve()),
}));

mock.module("../../utils/hash.util", () => ({
  default: {
    hash: mock(() => ({ salt: "salt", hash: "hash" })),
    verify: mock(() => true),
  },
}));

mock.module("../../utils/jwt.util", () => ({
  default: {
    generateAccessToken: mock(() => "accessToken"),
    generateRefreshToken: mock(() => "refreshToken"),
    validateRefreshToken: mock(() => ({ userId: "userid-1" })),
  },
}));

describe("Auth Controller", () => {
  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const user = { id: "userid-1", email: "test@example.com", salt: "salt", hash: "hash", status: Status.ACTIVE };
      (authService.findByEmail as any).mockResolvedValue(user);
      (hashUtil.verify as any).mockReturnValue(true);

      const req = mockRequest({ body: { email: "test@example.com", password: "password" } });
      const res = mockResponse();
      const next = mockNext();

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refreshToken", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ accessToken: "accessToken" });
      expect(auditService.audit).toHaveBeenCalled();
    });

    it("should throw AppError if user not found", async () => {
      (authService.findByEmail as any).mockResolvedValue(null);

      const req = mockRequest({ body: { email: "test@example.com", password: "password" } });
      const res = mockResponse();
      const next = mockNext();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0];
      expect(error.message).toBe("Invalid credentials");
      expect(error.statusCode).toBe(statusCodes.UNAUTHORIZED);
    });

    it("should throw AppError if password invalid", async () => {
      const user = { id: "userid-1", email: "test@example.com", salt: "salt", hash: "hash", status: Status.ACTIVE };
      (authService.findByEmail as any).mockResolvedValue(user);
      (hashUtil.verify as any).mockReturnValue(false);

      const req = mockRequest({ body: { email: "test@example.com", password: "password" } });
      const res = mockResponse();
      const next = mockNext();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(auditService.audit).toHaveBeenCalledWith("userid-1", "FAILED_LOGIN", "User", "userid-1");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      (authService.findByEmail as any).mockResolvedValue(null);
      (authService.create as any).mockResolvedValue({ id: "userid-2", name: "New User" });

      const req = mockRequest({ body: { name: "New User", email: "new@example.com", password: "password" } });
      const res = mockResponse();
      const next = mockNext();

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ accessToken: "accessToken" });
      expect(auditService.audit).toHaveBeenCalled();
    });

    it("should throw AppError if user already exists", async () => {
      (authService.findByEmail as any).mockResolvedValue({ id: "1" });

      const req = mockRequest({ body: { email: "new@example.com" } });
      const res = mockResponse();
      const next = mockNext();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as any).mock.calls[0][0].message).toBe("User already exists");
    });
  });

  describe("refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const req = mockRequest({ cookies: { refreshToken: "validToken" } });
      const res = mockResponse();
      const next = mockNext();

      (jwtUtil.validateRefreshToken as any).mockReturnValue({ userId: "userid-1" });
      (authService.findById as any).mockResolvedValue({ id: "userid-1", status: Status.ACTIVE });

      await refresh(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refreshToken", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ accessToken: "accessToken" });
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success", async () => {
      const req = mockRequest({ user: { id: "userid-1" } as any });
      const res = mockResponse();
      const next = mockNext();

      await logout(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(auditService.audit).toHaveBeenCalledWith("userid-1", "USER_LOGOUT", "User", "userid-1");
    });
  });
});
