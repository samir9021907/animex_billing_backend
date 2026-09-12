import { FastifyInstance } from "fastify";
import medicalProductController from "../controllers/medical_product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function medicalProductRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));

  fastify.post("/client/:client_id/medical-products", medicalProductController.createProduct);
  fastify.get("/client/:client_id/medical-products", medicalProductController.getAllProducts);
  fastify.get("/client/:client_id/medical-products/:id", medicalProductController.getProductById);
  fastify.put("/client/:client_id/medical-products/:id", medicalProductController.updateProduct);
  fastify.patch("/client/:client_id/medical-products/:id/quantity", medicalProductController.updateProductQuantityRaw);
  fastify.delete("/client/:client_id/medical-products/:id", medicalProductController.deleteProduct);
}
