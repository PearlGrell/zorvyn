import type { NextFunction, Request, Response } from "express";
import * as usersService from "../services/users.service";
import statusCodes from "../constants/status_codes";
import { AppError } from "../utils/error.util";
import { Prisma, Status } from "../../generated/prisma/client";
import hashUtil from "../utils/hash.util";

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        const user = req.user;
        if (!user) {
            throw new AppError("User not found", statusCodes.NOT_FOUND);
        }

        const { salt, hash, ...userResponse } = user;
        res.status(statusCodes.OK).json({ user: userResponse });
    } catch (error) {
        next(error);
    }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const { search, sortBy, sortOrder, limit, cursor } = req.query as usersService.UserQueryParams;

        const { users, nextCursor } = await usersService.findAll({
            search,
            sortBy,
            sortOrder,
            limit,
            cursor
        });

        res.status(statusCodes.OK).json({
            users,
            pagination: {
                nextCursor
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const user = await usersService.findByIdSafe(id);

        if (!user) {
            throw new AppError("User not found", statusCodes.NOT_FOUND);
        }

        res.status(statusCodes.OK).json({ user });
    } catch (error) {
        next(error);
    }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await usersService.findByEmailSafe(email);
        if (existingUser) {
            throw new AppError("User already exists", statusCodes.BAD_REQUEST);
        }

        const { salt, hash } = hashUtil.hash(password);
        const newUser = await usersService.create({ name, email, salt, hash, role }, req.user?.id);

        res.status(statusCodes.CREATED).json({ user: newUser });
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { name, email, role, status, password } = req.body;

        if (password) {
            const { salt, hash } = hashUtil.hash(password);
            await usersService.updatePassword(id, salt, hash, req.user?.id!);
        }

        const updateData: Prisma.UserUncheckedUpdateInput = { name, email, role, status };
        Object.keys(updateData).forEach(key => (updateData as Record<string, unknown>)[key] === undefined && delete (updateData as Record<string, unknown>)[key]);

        const updatedUser = await usersService.update(id, updateData, req.user?.id!);
        res.status(statusCodes.OK).json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError("Not authenticated", statusCodes.UNAUTHORIZED);
        }

        await usersService.updateUserStatus(userId, Status.INACTIVE, userId);

        res.clearCookie("refreshToken");
        
        res.status(statusCodes.OK).json({ message: "Account deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        
        const user = await usersService.findByIdSafe(id);
        if (!user) {
            throw new AppError("User not found", statusCodes.NOT_FOUND);
        }

        await usersService.updateUserStatus(id, Status.DELETED, req.user?.id!);
        
        res.status(statusCodes.OK).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
}
