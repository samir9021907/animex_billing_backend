import { FastifyRequest, FastifyReply } from "fastify";
import userService from "../services/user.service";

class UserController {

    // CREATE
    async createUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const user = await userService.createUser(body);

            return reply.code(201).send({
                success: true,
                message: "User created successfully",
                data: user,
            });
        } catch (error: any) {
            return reply.code(400).send({
                success: false,
                message: error.message || "Error creating user",
                error,
            });
        }
    }

    // GET ALL
    async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id,
            };

            const users = await userService.getAllUsers(query);

            return reply.send({
                success: true,
                data: users,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error fetching users",
                error,
            });
        }
    }

    // GET BY ID
    async getUserById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const user = await userService.getUserById(id, client_id);

            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            return reply.send({
                success: true,
                data: user,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error fetching user",
                error,
            });
        }
    }

    // UPDATE
    async updateUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const user = await userService.updateUser(id, body);

            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found for update",
                });
            }

            return reply.send({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error: any) {
            return reply.code(400).send({
                success: false,
                message: error.message || "Error updating user",
                error,
            });
        }
    }

    // DELETE
    async deleteUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const user = await userService.getUserById(id, client_id);
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            await userService.deleteUser(id, client_id);

            return reply.send({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error deleting user",
                error,
            });
        }
    }
}

export default new UserController();
