import { FastifyInstance } from "fastify";
import medicalStoreController from "../controllers/medical_store.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

export default async function medicalStoreRoutes(
    fastify: FastifyInstance
) {
    fastify.addHook("preHandler", authMiddleware);
    fastify.addHook("preHandler", roleMiddleware(["superadmin", "admin", "businessowner"]));

    // CREATE
    fastify.post(
        `/client/:client_id/medical-stores`,
        medicalStoreController.createStore
    );

    // GET ALL WITH FILTERS
    fastify.get(
        `/client/:client_id/medical-stores`,
        medicalStoreController.getAllStores
    );

    // GET BY ID
    fastify.get(
        `/client/:client_id/medical-stores/:id`,
        medicalStoreController.getStoreById
    );

    // UPDATE
    fastify.put(
        `/client/:client_id/medical-stores/:id`,
        medicalStoreController.updateStore
    );

    // DELETE
    fastify.delete(
        `/client/:client_id/medical-stores/:id`,
        medicalStoreController.deleteStore
    );
}
