import type { NextFunction, Request, Response } from "express";
import statusCodes from "../constants/status_codes";
import { Role, Permission, Status } from "../../generated/prisma/client";

const VIEWER_PERMISSIONS = [
    Permission.VIEW_DASHBOARD,
];

const ANALYST_PERMISSIONS = [
    ...VIEWER_PERMISSIONS,
    Permission.READ_RECORDS,
    Permission.VIEW_INSIGHTS,
];

const ADMIN_PERMISSIONS = [
    ...ANALYST_PERMISSIONS,
    Permission.CREATE_RECORDS,
    Permission.UPDATE_RECORDS,
    Permission.DELETE_RECORDS,
    Permission.MANAGE_USERS,
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: ADMIN_PERMISSIONS,
    [Role.ANALYST]: ANALYST_PERMISSIONS,
    [Role.VIEWER]: VIEWER_PERMISSIONS,
};

export function checkPermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(statusCodes.UNAUTHORIZED).json({ message: "Not authenticated" });
            return;
        }

        const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
        if (!userPermissions.includes(permission)) {
            res.status(statusCodes.FORBIDDEN).json({ message: "Insufficient permissions" });
            return;
        }

        const writeMethods = ["POST", "PATCH", "PUT", "DELETE"];
        if (req.user.status === Status.RESTRICTED && writeMethods.includes(req.method)) {
            res.status(statusCodes.FORBIDDEN).json({ message: "Write access restricted for this account" });
            return;
        }

        next();
    };
}
