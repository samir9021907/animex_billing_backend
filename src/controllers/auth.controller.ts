import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService = new AuthService();

  signup = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.authService.signup(req.body);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || "Error signing up",
        error
      });
    }
  };

  login = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password }: any = req.body;
      const result = await this.authService.login({ email, password });
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || "Error logging in",
        error
      });
    }
  };
}
