import prisma from "../config/prisma.config";
import { Prisma, type TransactionCategory } from "../../generated/prisma/client";
import { audit } from "./audit.service";

export interface CategoryQueryParams {
    search?: string;
    sortBy?: 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string;
}

export interface CategoryPaginatedResponse {
    categories: TransactionCategory[];
    nextCursor?: string | null;
}

export async function findAll(params: CategoryQueryParams = {}): Promise<CategoryPaginatedResponse> {
    const {
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 10,
        cursor,
    } = params;

    const where: Prisma.TransactionCategoryWhereInput = {};
    if (search) {
        where.name = {
            contains: search,
        };
    }

    const query: Prisma.TransactionCategoryFindManyArgs = {
        where,
        orderBy: {
            [sortBy]: sortOrder,
        },
        take: limit,
    };

    if (cursor) {
        query.cursor = { id: cursor };
        query.skip = 1;
    }

    const categories = await prisma.transactionCategory.findMany(query);

    const nextCursor = (categories.length > 0 && categories.length === limit)
        ? categories[categories.length - 1]?.id
        : null;

    return {
        categories,
        nextCursor,
    };
}

export async function findById(id: string): Promise<TransactionCategory | null> {
    return await prisma.transactionCategory.findUnique({ where: { id } });
}

export async function create(name: string, performingUserId: string): Promise<TransactionCategory> {
    const category = await prisma.transactionCategory.create({
        data: {
            name,
        },
    });

    await audit(performingUserId, "CREATE_CATEGORY", "Category", category.id);
    return category;
}

export async function update(id: string, name: string, performingUserId: string): Promise<TransactionCategory> {
    const category = await prisma.transactionCategory.update({
        where: { id },
        data: { name },
    });

    await audit(performingUserId, "UPDATE_CATEGORY", "Category", id);
    return category;
}

export async function deleteCategory(id: string, performingUserId: string): Promise<TransactionCategory> {
    const category = await prisma.transactionCategory.delete({
        where: { id },
    });

    await audit(performingUserId, "DELETE_CATEGORY", "Category", id);
    return category;
}
