import { FastifyInstance } from "fastify";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function userRoutes(
    fastify: FastifyInstance
) {
    // CREATE (Unauthenticated - No Token Required)
    fastify.post(
        `/client/:client_id/users`,
        userController.createUser
    );

    // Protected Routes (Token Required)
    fastify.register(async (authRoute) => {
        authRoute.addHook("preHandler", authMiddleware);

        // GET ALL WITH FILTERS
        authRoute.get(
            `/client/:client_id/users`,
            userController.getAllUsers
        );

        // GET BY ID
        authRoute.get(
            `/client/:client_id/users/:id`,
            userController.getUserById
        );

        // UPDATE
        authRoute.put(
            `/client/:client_id/users/:id`,
            userController.updateUser
        );

        // DELETE
        authRoute.delete(
            `/client/:client_id/users/:id`,
            userController.deleteUser
        );
    });
}
