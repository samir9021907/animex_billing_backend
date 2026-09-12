import { FastifyRequest, FastifyReply } from "fastify";
import clientService from "../services/client.service";

class ClientController {

    // CREATE
    async createClient(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const body = request.body as any;

            const client = await clientService.createClient(body);

            return reply.code(201).send({
                success: true,
                message: "Client created successfully",
                data: client,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error creating client",
                error,
            });
        }
    }

    // GET ALL
    async getAllClients(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const query = request.query as any;

            const clients = await clientService.getAllClients(query);

            return reply.send({
                success: true,
                data: clients,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching clients",
                error,
            });
        }
    }

    // GET BY ID
    async getClientById(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };

            const client = await clientService.getClientById(id);

            if (!client) {
                return reply.code(404).send({
                    success: false,
                    message: "Client not found",
                });
            }

            return reply.send({
                success: true,
                data: client,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching client",
                error,
            });
        }
    }

    // UPDATE
    async updateClient(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const client = await clientService.updateClient(id, body);

            return reply.send({
                success: true,
                message: "Client updated successfully",
                data: client,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error updating client",
                error,
            });
        }
    }

    // DELETE
    async deleteClient(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { id } = request.params as { id: string };

            await clientService.deleteClient(id);

            return reply.send({
                success: true,
                message: "Client deleted successfully",
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error deleting client",
                error,
            });
        }
    }
}

export default new ClientController();
