import { FastifyInstance } from "fastify";
import productCategoryController from "../controllers/product_category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function productCategoryRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));

  fastify.post("/client/:client_id/product-categories", productCategoryController.createCategory);
  fastify.get("/client/:client_id/product-categories", productCategoryController.getAllCategories);
  fastify.get("/client/:client_id/product-categories/:id", productCategoryController.getCategoryById);
  fastify.put("/client/:client_id/product-categories/:id", productCategoryController.updateCategory);
  fastify.delete("/client/:client_id/product-categories/:id", productCategoryController.deleteCategory);
}
