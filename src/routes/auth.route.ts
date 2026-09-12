import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";

export default async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();

  fastify.post("/signup", authController.signup);
  fastify.post("/login", authController.login);
}
