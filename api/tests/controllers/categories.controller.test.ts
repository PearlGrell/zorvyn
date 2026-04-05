import { describe, it, expect, mock } from "bun:test";
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../../controllers/categories.controller";
import * as categoriesService from "../../services/categories.service";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";
import { AppError } from "../../utils/error.util";


mock.module("../../services/categories.service", () => ({
  findAll: mock(() => Promise.resolve({ categories: [], nextCursor: null })),
  findById: mock(() => Promise.resolve(null)),
  create: mock(() => Promise.resolve({ id: "1", name: "New Category" })),
  update: mock(() => Promise.resolve({ id: "1", name: "Updated Category" })),
  deleteCategory: mock(() => Promise.resolve({ id: "1", name: "Deleted Category" })),
}));

describe("Categories Controller", () => {
  describe("getAllCategories", () => {
    it("should return all categories with status 200", async () => {
      const categories = [{ id: "1", name: "Food" }];
      (categoriesService.findAll as any).mockResolvedValue({ categories, nextCursor: null });

      const req = mockRequest({ query: { limit: 10 } as any });
      const res = mockResponse();
      const next = mockNext();

      await getAllCategories(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        categories,
        pagination: { nextCursor: null }
      });
    });
  });

  describe("getCategoryById", () => {
    it("should return a category if found", async () => {
      const category = { id: "1", name: "Food" };
      (categoriesService.findById as any).mockResolvedValue(category);

      const req = mockRequest({ params: { id: "1" } });
      const res = mockResponse();
      const next = mockNext();

      await getCategoryById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ category });
    });

    it("should throw AppError if category not found", async () => {
      (categoriesService.findById as any).mockResolvedValue(null);

      const req = mockRequest({ params: { id: "999" } });
      const res = mockResponse();
      const next = mockNext();

      await getCategoryById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as any).mock.calls[0][0].statusCode).toBe(statusCodes.NOT_FOUND);
    });
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      const category = { id: "1", name: "New Category" };
      (categoriesService.create as any).mockResolvedValue(category);

      const req = mockRequest({ body: { name: "New Category" }, user: { id: "admin-id" } as any });
      const res = mockResponse();
      const next = mockNext();

      await createCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ category });
    });
  });
});
