import { describe, it, expect, mock } from "bun:test";
import { getDashboardSummary } from "../../controllers/dashboard.controller";
import * as dashboardService from "../../services/dashboard.service";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";


mock.module("../../services/dashboard.service", () => ({
  getSummary: mock(() => Promise.resolve({ totalTransactions: 100 })),
  getCategoryBreakdown: mock(() => Promise.resolve([])),
  getRecentActivity: mock(() => Promise.resolve([])),
  getTrends: mock(() => Promise.resolve([])),
}));

describe("Dashboard Controller", () => {
  describe("getDashboardSummary", () => {
    it("should return dashboard summary data with status 200", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      const summaryData = { totalTransactions: 100 };
      const categoryBreakdown: any[] = [];
      const recentActivity: any[] = [];
      const trends: any[] = [];


      (dashboardService.getSummary as any).mockResolvedValue(summaryData);
      (dashboardService.getCategoryBreakdown as any).mockResolvedValue(categoryBreakdown);
      (dashboardService.getRecentActivity as any).mockResolvedValue(recentActivity);
      (dashboardService.getTrends as any).mockResolvedValue(trends);

      await getDashboardSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        summary: summaryData,
        categoryBreakdown,
        recentActivity,
        trends,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if service fails", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      const error = new Error("Service failed");
      (dashboardService.getSummary as any).mockRejectedValue(error);

      await getDashboardSummary(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
