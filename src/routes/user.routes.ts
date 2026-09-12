import { FastifyInstance } from "fastify";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function userRoutes(fastify: FastifyInstance) {
  // Public
  fastify.post("/client/:client_id/users", userController.createUser);

  // Protected
  fastify.register(async (auth) => {
    auth.addHook("preHandler", authMiddleware);
    auth.get("/client/:client_id/users", userController.getAllUsers);
    auth.get("/client/:client_id/users/:id", userController.getUserById);
    auth.put("/client/:client_id/users/:id", userController.updateUser);
    auth.delete("/client/:client_id/users/:id", userController.deleteUser);
  });
}
