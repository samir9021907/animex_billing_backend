import { FastifyInstance } from "fastify";
import medicalProductController from "../controllers/medical_product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

export default async function medicalProductRoutes(
    fastify: FastifyInstance
) {
    fastify.addHook("preHandler", authMiddleware);
    fastify.addHook("preHandler", roleMiddleware(["superadmin", "admin", "businessowner"]));

    // CREATE
    fastify.post(
        `/client/:client_id/medical-products`,
        medicalProductController.createProduct
    );

    // GET ALL WITH FILTERS
    fastify.get(
        `/client/:client_id/medical-products`,
        medicalProductController.getAllProducts
    );

    // GET BY ID
    fastify.get(
        `/client/:client_id/medical-products/:id`,
        medicalProductController.getProductById
    );

    // UPDATE
    fastify.put(
        `/client/:client_id/medical-products/:id`,
        medicalProductController.updateProduct
    );

    // DELETE
    fastify.delete(
        `/client/:client_id/medical-products/:id`,
        medicalProductController.deleteProduct
    );
}
