import { FastifyInstance } from "fastify";
import clientController from "../controllers/client.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function clientRoutes(
    fastify: FastifyInstance
) {
    // Unauthenticated: Public client creation & listing
    fastify.post(
        `/clients`,
        clientController.createClient
    );

    fastify.get(
        `/clients`,
        clientController.getAllClients
    );

    // Authenticated routes
    fastify.register(async (authRoute) => {
        authRoute.addHook("preHandler", authMiddleware);

        authRoute.get(
            `/clients/:id`,
            clientController.getClientById
        );

        authRoute.put(
            `/clients/:id`,
            clientController.updateClient
        );

        authRoute.delete(
            `/clients/:id`,
            clientController.deleteClient
        );
    });
}
