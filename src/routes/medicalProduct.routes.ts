import { FastifyInstance } from "fastify";
import medicalProductController from "../controllers/medical_product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function medicalProductRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));

  // ─────────────────────────────────────────────────────────────
  // 1. DIRECT / GLOBAL ROUTES (No client_id required in URL)
  // ─────────────────────────────────────────────────────────────
  // GET ALL Products (Returns all products, or filter via ?client_id=...)
  fastify.get("/medical-products", medicalProductController.getAllProducts);
  fastify.get("/", medicalProductController.getAllProducts);

  // GET Product By ID
  fastify.get("/medical-products/:id", medicalProductController.getProductById);
  fastify.get("/:id", medicalProductController.getProductById);

  // CREATE Product (client_id provided in body or token)
  fastify.post("/medical-products", medicalProductController.createProduct);
  fastify.post("/", medicalProductController.createProduct);

  // UPDATE Product By ID
  fastify.put("/medical-products/:id", medicalProductController.updateProduct);
  fastify.put("/:id", medicalProductController.updateProduct);

  // UPDATE Quantity By ID
  fastify.patch("/medical-products/:id/quantity", medicalProductController.updateProductQuantityRaw);
  fastify.patch("/:id/quantity", medicalProductController.updateProductQuantityRaw);

  // DELETE Product By ID
  fastify.delete("/medical-products/:id", medicalProductController.deleteProduct);
  fastify.delete("/:id", medicalProductController.deleteProduct);

  // ─────────────────────────────────────────────────────────────
  // 2. CLIENT-SPECIFIC ROUTES (With client_id in URL)
  // ─────────────────────────────────────────────────────────────
  fastify.post("/client/:client_id/medical-products", medicalProductController.createProduct);
  fastify.get("/client/:client_id/medical-products", medicalProductController.getAllProducts);
  fastify.get("/client/:client_id/medical-products/:id", medicalProductController.getProductById);
  fastify.put("/client/:client_id/medical-products/:id", medicalProductController.updateProduct);
  fastify.patch("/client/:client_id/medical-products/:id/quantity", medicalProductController.updateProductQuantityRaw);
  fastify.delete("/client/:client_id/medical-products/:id", medicalProductController.deleteProduct);
}
