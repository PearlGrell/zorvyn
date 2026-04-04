import type { NextFunction, Request, Response } from "express";
import * as categoriesService from "../services/categories.service";
import statusCodes from "../constants/status_codes";
import { AppError } from "../utils/error.util";

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const { search, sortBy, sortOrder, limit, cursor } = req.query as any;

        const { categories, nextCursor } = await categoriesService.findAll({
            search,
            sortBy,
            sortOrder,
            limit,
            cursor
        });

        res.status(statusCodes.OK).json({ 
            categories,
            pagination: {
                nextCursor
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const category = await categoriesService.findById(id);

        if (!category) {
            throw new AppError("Category not found", statusCodes.NOT_FOUND);
        }

        res.status(statusCodes.OK).json({ category });
    } catch (error) {
        next(error);
    }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body;

        const category = await categoriesService.create(name, req.user?.id!);
        res.status(statusCodes.CREATED).json({ category });
    } catch (error) {
        next(error);
    }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const { name } = req.body;

        const category = await categoriesService.update(id, name, req.user?.id!);
        res.status(statusCodes.OK).json({ category });
    } catch (error) {
        next(error);
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id as string;
        const category = await categoriesService.deleteCategory(id, req.user?.id!);
        res.status(statusCodes.OK).json({ category });
    } catch (error) {
        next(error);
    }
}
