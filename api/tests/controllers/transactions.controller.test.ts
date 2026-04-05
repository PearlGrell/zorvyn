import { describe, it, expect, mock } from "bun:test";
import { getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction } from "../../controllers/transactions.controller";
import * as transactionsService from "../../services/transactions.service";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";
import { AppError } from "../../utils/error.util";


mock.module("../../services/transactions.service", () => ({
  findAll: mock(() => Promise.resolve({ transactions: [], nextCursor: null })),
  findById: mock(() => Promise.resolve(null)),
  create: mock(() => Promise.resolve({ id: "1", amount: 100 })),
  update: mock(() => Promise.resolve({ id: "1", amount: 200 })),
  deleteTransaction: mock(() => Promise.resolve({ id: "1", amount: 100 })),
}));

describe("Transactions Controller", () => {
  describe("getAllTransactions", () => {
    it("should return transactions with status 200", async () => {
      const transactions = [{ id: "1", amount: 100 }];
      (transactionsService.findAll as any).mockResolvedValue({ transactions, nextCursor: null });

      const req = mockRequest({ query: { limit: 10 } as any, user: { id: "user-1" } as any });
      const res = mockResponse();
      const next = mockNext();

      await getAllTransactions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        transactions,
        pagination: { nextCursor: null }
      });
    });
  });

  describe("getTransactionById", () => {
    it("should return a transaction if found", async () => {
      const transaction = { id: "1", amount: 100 };
      (transactionsService.findById as any).mockResolvedValue(transaction);

      const req = mockRequest({ params: { id: "1" } });
      const res = mockResponse();
      const next = mockNext();

      await getTransactionById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ transaction });
    });

    it("should throw AppError if transaction not found", async () => {
      (transactionsService.findById as any).mockResolvedValue(null);

      const req = mockRequest({ params: { id: "999" } });
      const res = mockResponse();
      const next = mockNext();

      await getTransactionById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("createTransaction", () => {
    it("should create a transaction successfully", async () => {
      const transaction = { id: "1", amount: 100 };
      (transactionsService.create as any).mockResolvedValue(transaction);

      const req = mockRequest({
        body: { amount: "100", type: "EXPENSE", categoryId: "cat-1", date: "2024-01-01", notes: "test" },
        user: { id: "user-1" } as any
      });
      const res = mockResponse();
      const next = mockNext();

      await createTransaction(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ transaction });
    });
  });
});
