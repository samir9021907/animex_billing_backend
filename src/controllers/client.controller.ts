import { FastifyRequest, FastifyReply } from "fastify";
import clientService from "../services/client.service";
import { validateString, validatePhoneNumber, validateEmail } from "../utils/validation.util";

class ClientController {

    // CREATE
    async createClient(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const payload = (request.body as any) || {};

            // 1. Validate Client Name
            const nameVal = validateString(payload.name, "Client / Company Name", 2, 150, true);
            if (!nameVal.isValid) {
                return reply.code(400).send({ success: false, message: nameVal.error });
            }

            // 2. Validate Phone if provided
            let phone = null;
            if (payload.phone !== undefined && payload.phone !== null && String(payload.phone).trim() !== "") {
                const phoneVal = validatePhoneNumber(payload.phone, "Phone Number", false);
                if (!phoneVal.isValid) {
                    return reply.code(400).send({ success: false, message: phoneVal.error });
                }
                phone = phoneVal.value;
            }

            // 3. Validate Email if provided
            let email = null;
            if (payload.email !== undefined && payload.email !== null && String(payload.email).trim() !== "") {
                const emailVal = validateEmail(payload.email, "Email", false);
                if (!emailVal.isValid) {
                    return reply.code(400).send({ success: false, message: emailVal.error });
                }
                email = emailVal.value;
            }

            const body = {
                ...payload,
                name: nameVal.value,
                phone,
                email,
            };

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
            const payload = (request.body as any) || {};
            const updateBody: any = {};

            if (payload.name !== undefined) {
                const nameVal = validateString(payload.name, "Client / Company Name", 2, 150, true);
                if (!nameVal.isValid) {
                    return reply.code(400).send({ success: false, message: nameVal.error });
                }
                updateBody.name = nameVal.value;
            }

            if (payload.phone !== undefined) {
                if (payload.phone === null || String(payload.phone).trim() === "") {
                    updateBody.phone = null;
                } else {
                    const phoneVal = validatePhoneNumber(payload.phone, "Phone Number", false);
                    if (!phoneVal.isValid) {
                        return reply.code(400).send({ success: false, message: phoneVal.error });
                    }
                    updateBody.phone = phoneVal.value;
                }
            }

            if (payload.email !== undefined) {
                if (payload.email === null || String(payload.email).trim() === "") {
                    updateBody.email = null;
                } else {
                    const emailVal = validateEmail(payload.email, "Email", false);
                    if (!emailVal.isValid) {
                        return reply.code(400).send({ success: false, message: emailVal.error });
                    }
                    updateBody.email = emailVal.value;
                }
            }

            if (payload.address !== undefined) updateBody.address = payload.address;
            if (payload.city !== undefined) updateBody.city = payload.city;
            if (payload.status !== undefined) updateBody.status = payload.status;

            const client = await clientService.updateClient(id, updateBody);

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
