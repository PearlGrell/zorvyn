import prisma from "../config/prisma.config";
import { Status, Role, type User } from "../../generated/prisma/client";
import { audit } from "./audit.service";

export type SafeUser = Omit<User, 'salt' | 'hash'>;

export interface UserQueryParams {
    search?: string;
    sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string;
}

export interface UserPaginatedResponse {
    users: SafeUser[];
    nextCursor?: string | null;
}

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};

export async function findAll(params: UserQueryParams = {}): Promise<UserPaginatedResponse> {
    const {
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 10,
        cursor,
    } = params;

    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }

    const query: any = {
        where,
        orderBy: {
            [sortBy]: sortOrder,
        },
        take: limit,
        select: userSelect,
    };

    if (cursor) {
        query.cursor = { id: cursor };
        query.skip = 1;
    }

    const users = await prisma.user.findMany(query) as SafeUser[];

    const nextCursor = (users.length > 0 && users.length === limit)
        ? users[users.length - 1]?.id
        : null;

    return {
        users,
        nextCursor,
    };
}

export async function findByEmailSafe(email: string): Promise<SafeUser | null> {
    return await prisma.user.findUnique({
        where: { email },
        select: userSelect,
    }) as SafeUser | null;
}

export async function findByIdSafe(id: string): Promise<SafeUser | null> {
    return await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    }) as SafeUser | null;
}

export async function updateUserStatus(id: string, status: Status, performingUserId: string): Promise<SafeUser> {
    const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: userSelect,
    }) as SafeUser;

    await audit(performingUserId, "UPDATE_STATUS", "User", id);
    return user;
}

export async function create(data: { name: string; email: string; salt: string; hash: string; role?: Role }, performingUserId?: string): Promise<SafeUser> {
    const user = await prisma.user.create({
        data: {
            ...data,
            role: data.role || Role.VIEWER,
            status: Status.ACTIVE,
        },
        select: userSelect,
    }) as SafeUser;

    await audit(performingUserId || user.id, "CREATE_USER", "User", user.id);
    return user;
}

export async function update(id: string, data: Partial<{ name: string; email: string; role: Role; status: Status }>, performingUserId: string): Promise<SafeUser> {
    const user = await prisma.user.update({
        where: { id },
        data,
        select: userSelect,
    }) as SafeUser;

    await audit(performingUserId, "UPDATE_USER", "User", id);
    return user;
}

export async function updatePassword(id: string, salt: string, hash: string, performingUserId: string): Promise<void> {
    await prisma.user.update({
        where: { id },
        data: { salt, hash },
    });

    await audit(performingUserId, "UPDATE_PASSWORD", "User", id);
}
