import { FastifyInstance } from "fastify";
import productCategoryController from "../controllers/product_category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

export default async function productCategoryRoutes(
    fastify: FastifyInstance
) {
    fastify.addHook("preHandler", authMiddleware);
    fastify.addHook("preHandler", roleMiddleware(["superadmin", "admin", "businessowner"]));

    // CREATE
    fastify.post(
        `/client/:client_id/product-categories`,
        productCategoryController.createCategory
    );

    // GET ALL WITH FILTERS
    fastify.get(
        `/client/:client_id/product-categories`,
        productCategoryController.getAllCategories
    );

    // GET BY ID
    fastify.get(
        `/client/:client_id/product-categories/:id`,
        productCategoryController.getCategoryById
    );

    // UPDATE
    fastify.put(
        `/client/:client_id/product-categories/:id`,
        productCategoryController.updateCategory
    );

    // DELETE
    fastify.delete(
        `/client/:client_id/product-categories/:id`,
        productCategoryController.deleteCategory
    );
}
