import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller";
import createCategoryValidator from "../validators/categories.validators/create.category.validator";
import updateCategoryValidator from "../validators/categories.validators/update.category.validator";
import getAllCategoriesValidator from "../validators/categories.validators/get-all.categories.validator";
import { authMiddleware } from "../middlewares/authenticate.middleware";
import { checkPermission } from "../middlewares/authorize.middleware";
import { Permission } from "../../generated/prisma/client";

const category = Router();

category.get('/', authMiddleware, checkPermission(Permission.READ_RECORDS), getAllCategoriesValidator, categoriesController.getAllCategories);
category.get('/:id', authMiddleware, checkPermission(Permission.READ_RECORDS), categoriesController.getCategoryById);
category.post('/', authMiddleware, checkPermission(Permission.CREATE_RECORDS), createCategoryValidator, categoriesController.createCategory);
category.patch('/:id', authMiddleware, checkPermission(Permission.UPDATE_RECORDS), updateCategoryValidator, categoriesController.updateCategory);
category.delete('/:id', authMiddleware, checkPermission(Permission.DELETE_RECORDS), categoriesController.deleteCategory);

export default category;