import type { NextFunction, Request, Response } from "express";
import { create, findByEmail, findById } from "../services/auth.service";
import statusCodes from "../constants/status_codes";
import { AppError } from "../utils/error.util";
import hashUtil from "../utils/hash.util";
import jwtUtil from "../utils/jwt.util";
import { Status } from "../../generated/prisma/enums";
import { audit } from "../services/audit.service";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const user = await findByEmail(email);

        if (user === null) {
            throw new AppError("Invalid credentials", statusCodes.UNAUTHORIZED);
        }

        if (user.status === Status.INACTIVE || user.status === Status.DELETED) {
            throw new AppError("Account is inactive or deleted", statusCodes.UNAUTHORIZED);
        }

        const isPasswordValid = hashUtil.verify(password, user.salt, user.hash);
        if (!isPasswordValid) {
            await audit(user.id, "FAILED_LOGIN", "User", user.id);
            throw new AppError("Invalid credentials", statusCodes.UNAUTHORIZED);
        }

        const accessToken = jwtUtil.generateAccessToken(user.id);
        const refreshToken = jwtUtil.generateRefreshToken(user.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        await audit(user.id, "USER_LOGIN", "User", user.id);

        res.status(statusCodes.OK).json({
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;
        const user = await findByEmail(email);

        if (user !== null) {
            throw new AppError("User already exists", statusCodes.BAD_REQUEST);
        }

        const { salt, hash } = hashUtil.hash(password);
        const newUser = await create(name, email, salt, hash);

        const accessToken = jwtUtil.generateAccessToken(newUser.id);
        const refreshToken = jwtUtil.generateRefreshToken(newUser.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        await audit(newUser.id, "USER_REGISTER", "User", newUser.id);

        res.status(statusCodes.CREATED).json({
            accessToken,
        });
    } catch (err) {
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AppError("No refresh token provided", statusCodes.UNAUTHORIZED);
        }

        const decoded = jwtUtil.validateRefreshToken(refreshToken);

        if (!decoded) {
            throw new AppError("Invalid or expired refresh token", statusCodes.UNAUTHORIZED);
        }

        const user = await findById(decoded.userId);

        if (!user || user.status === Status.INACTIVE || user.status === Status.DELETED) {
            throw new AppError("Account is inactive or deleted", statusCodes.UNAUTHORIZED);
        }

        const newAccessToken = jwtUtil.generateAccessToken(user.id);
        const newRefreshToken = jwtUtil.generateRefreshToken(user.id);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.status(statusCodes.OK).json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user?.id) {
            await audit(req.user.id, "USER_LOGOUT", "User", req.user.id);
        }
        res.clearCookie("refreshToken");
        res.status(statusCodes.OK).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
}