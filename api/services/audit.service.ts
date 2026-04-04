import environmentConfig from "../config/environment.config";
import prisma from "../config/prisma.config";

export async function audit(userId: string | null | undefined, action: string, entity: string, entityId: string) {
    try {
        await prisma.auditLogs.create({
            data: {
                userId: userId || null,
                action,
                entity,
                entityId,
            },
        });
    } catch (error) {
        if (environmentConfig.ENV !== "production") {
            console.error(`Failed to create audit log: ${action} on ${entity}:${entityId}`, error);
        }
    }
}
