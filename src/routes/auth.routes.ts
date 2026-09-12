import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";

const authController = new AuthController();

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/signup", authController.signup);
  fastify.post("/login", authController.login);
}
