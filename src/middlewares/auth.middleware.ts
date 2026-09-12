import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        message: "Authorization header missing"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return reply.status(401).send({
        message: "Token missing"
      });
    }

    const decoded: any = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || "default_secret"
    );

    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({
      message: "Invalid or expired token"
    });
  }
}
