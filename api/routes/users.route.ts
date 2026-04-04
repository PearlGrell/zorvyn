import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";
import getAllUsersValidator from "../validators/users.validators/get-all.users.validator";
import createUserValidator from "../validators/users.validators/create.user.validator";
import updateUserValidator from "../validators/users.validators/update.user.validator";

const user = Router();

user.get('/me', authMiddleware, usersController.getMe);
user.delete('/me', authMiddleware, checkPermission(Permission.READ_RECORDS), usersController.deleteMe);

user.get('/', authMiddleware, checkPermission(Permission.MANAGE_USERS), getAllUsersValidator, usersController.getAllUsers);
user.get('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), usersController.getUserById);
user.post('/', authMiddleware, checkPermission(Permission.MANAGE_USERS), createUserValidator, usersController.createUser);
user.patch('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), updateUserValidator, usersController.updateUser);
user.delete('/:id', authMiddleware, checkPermission(Permission.MANAGE_USERS), usersController.deleteUser);

export default user;