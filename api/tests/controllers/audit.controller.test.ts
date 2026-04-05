import { describe, it, expect, mock } from "bun:test";
import { getAuditLogs } from "../../controllers/audit.controller";
import prisma from "../../config/prisma.config";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";


mock.module("../../config/prisma.config", () => ({
  default: {
    auditLogs: {
      findMany: mock(() => Promise.resolve([])),
    },
  },
}));

describe("Audit Controller", () => {
  describe("getAuditLogs", () => {
    it("should return audit logs with status 200", async () => {
      const logs = [
        { id: "1", userId: "user-1", action: "LOGIN", entity: "User", timestamp: new Date() },
      ];
      (prisma.auditLogs.findMany as any).mockResolvedValue(logs);

      const req = mockRequest({
        query: { limit: 10 } as any,
      });
      const res = mockResponse();
      const next = mockNext();

      await getAuditLogs(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        logs,
        pagination: {
          nextCursor: null,
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle cursor pagination", async () => {
      const logs = Array.from({ length: 10 }, (_, i) => ({ id: `id-${i}`, action: "ACTION" }));
      (prisma.auditLogs.findMany as any).mockResolvedValue(logs);

      const req = mockRequest({
        query: { limit: 10, cursor: "prev-id" } as any,
      });
      const res = mockResponse();
      const next = mockNext();

      await getAuditLogs(req, res, next);

      expect(prisma.auditLogs.findMany).toHaveBeenCalledWith(expect.objectContaining({
        cursor: { id: "prev-id" },
        skip: 1,
        take: 10,
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pagination: {
          nextCursor: "id-9",
        },
      }));
    });

    it("should call next with error if prisma query fails", async () => {
      const error = new Error("Database error");
      (prisma.auditLogs.findMany as any).mockRejectedValue(error);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await getAuditLogs(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
