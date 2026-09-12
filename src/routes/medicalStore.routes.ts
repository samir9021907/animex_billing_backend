import { FastifyInstance } from "fastify";
import medicalStoreController from "../controllers/medical_store.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function medicalStoreRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));

  fastify.post("/client/:client_id/medical-stores", medicalStoreController.createStore);
  fastify.get("/client/:client_id/medical-stores", medicalStoreController.getAllStores);
  fastify.get("/client/:client_id/medical-stores/:id", medicalStoreController.getStoreById);
  fastify.put("/client/:client_id/medical-stores/:id", medicalStoreController.updateStore);
  fastify.delete("/client/:client_id/medical-stores/:id", medicalStoreController.deleteStore);
}
