import prisma from "../config/prisma.config";
import { Role, type User } from "../../generated/prisma/client";
import { audit } from "./audit.service";

export async function findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
}

export async function findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
}

export async function create(name: string, email: string, salt: string, hash: string): Promise<User> {
    const user = await prisma.user.create({
        data: {
            name,
            email,
            salt,
            hash,
            role: Role.VIEWER,
        },
    });

    await audit(user.id, "USER_REGISTERED", "User", user.id);
    return user;
}