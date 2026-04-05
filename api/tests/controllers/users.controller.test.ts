import { describe, it, expect, mock } from "bun:test";
import { getMe, getAllUsers, getUserById, createUser, updateUser, deleteMe, deleteUser } from "../../controllers/users.controller";
import * as usersService from "../../services/users.service";
import hashUtil from "../../utils/hash.util";
import { mockRequest, mockResponse, mockNext } from "../utils";
import statusCodes from "../../constants/status_codes";
import { AppError } from "../../utils/error.util";


mock.module("../../services/users.service", () => ({
  findAll: mock(() => Promise.resolve({ users: [], nextCursor: null })),
  findByIdSafe: mock(() => Promise.resolve(null)),
  findByEmailSafe: mock(() => Promise.resolve(null)),
  create: mock(() => Promise.resolve({ id: "1", name: "New User" })),
  update: mock(() => Promise.resolve({ id: "1", name: "Updated User" })),
  updateUserStatus: mock(() => Promise.resolve()),
  updatePassword: mock(() => Promise.resolve()),
}));


mock.module("../../utils/hash.util", () => ({
  default: {
    hash: mock(() => ({ salt: "salt", hash: "hash" })),
  },
}));

describe("Users Controller", () => {
  describe("getMe", () => {
    it("should return current user with status 200", async () => {
      const user = { id: "1", name: "Me", email: "me@example.com", salt: "s", hash: "h" };
      const req = mockRequest({ user: user as any });
      const res = mockResponse();
      const next = mockNext();

      await getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: "1", name: "Me", email: "me@example.com" }
      });
    });

    it("should throw AppError if req.user is missing", async () => {
      const req = mockRequest({ user: undefined });
      const res = mockResponse();
      const next = mockNext();

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("getAllUsers", () => {
    it("should return users with status 200", async () => {
      const users = [{ id: "1", name: "User 1" }];
      (usersService.findAll as any).mockResolvedValue({ users, nextCursor: null });

      const req = mockRequest({ query: { limit: "10" } as any });
      const res = mockResponse();
      const next = mockNext();

      await getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        users,
        pagination: { nextCursor: null }
      });
    });
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const newUser = { id: "2", name: "New User" };
      (usersService.findByEmailSafe as any).mockResolvedValue(null);
      (usersService.create as any).mockResolvedValue(newUser);

      const req = mockRequest({
        body: { name: "New User", email: "new@example.com", password: "password", role: "USER" },
        user: { id: "admin-id" } as any
      });
      const res = mockResponse();
      const next = mockNext();

      await createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(statusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({ user: newUser });
    });
  });
});
