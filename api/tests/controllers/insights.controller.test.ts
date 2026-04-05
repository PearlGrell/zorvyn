import { describe, it, expect, mock } from "bun:test";
import { getDashboardInsights } from "../../controllers/insights.controller";
import * as insightsService from "../../services/insights.service";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";


mock.module("../../services/insights.service", () => ({
  getCategorySpending: mock(() => Promise.resolve([])),
  getMonthlySummary: mock(() => Promise.resolve({})),
  getRecentTrends: mock(() => Promise.resolve([])),
}));

describe("Insights Controller", () => {
  describe("getDashboardInsights", () => {
    it("should return insights data for a user with status 200", async () => {
      const categorySpending = [{ category: "Food", amount: 100 }];
      const monthlySummary = { totalSpent: 500 };
      const recentTrends = [{ date: "2024-01-01", amount: 50 }];

      (insightsService.getCategorySpending as any).mockResolvedValue(categorySpending);
      (insightsService.getMonthlySummary as any).mockResolvedValue(monthlySummary);
      (insightsService.getRecentTrends as any).mockResolvedValue(recentTrends);

      const req = mockRequest({ user: { id: "user-123" } as any, query: { startDate: "2024-01-01" } as any });
      const res = mockResponse();
      const next = mockNext();

      await getDashboardInsights(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        categorySpending,
        monthlySummary,
        recentTrends,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if service fails", async () => {
      const error = new Error("Service failed");
      (insightsService.getCategorySpending as any).mockRejectedValue(error);

      const req = mockRequest({ user: { id: "user-123" } as any });
      const res = mockResponse();
      const next = mockNext();

      await getDashboardInsights(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
