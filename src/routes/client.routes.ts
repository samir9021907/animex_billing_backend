import { FastifyInstance } from "fastify";
import clientController from "../controllers/client.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default async function clientRoutes(fastify: FastifyInstance) {
  // Public
  fastify.post("/clients", clientController.createClient);
  fastify.get("/clients", clientController.getAllClients);

  // Protected
  fastify.register(async (auth) => {
    auth.addHook("preHandler", authMiddleware);
    auth.get("/clients/:id", clientController.getClientById);
    auth.put("/clients/:id", clientController.updateClient);
    auth.delete("/clients/:id", clientController.deleteClient);
  });
}
