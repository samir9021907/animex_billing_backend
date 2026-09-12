import { FastifyReply, FastifyRequest } from "fastify";

export function roleMiddleware(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !user.role) {
      return reply.status(403).send({
        success: false,
        message: "Access denied. No role found."
      });
    }

    const hasRole = allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase());
    if (!hasRole) {
      return reply.status(403).send({
        success: false,
        message: "Access denied. Unauthorized role."
      });
    }
  };
}
