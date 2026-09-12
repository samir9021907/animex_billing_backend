import { FastifyRequest, FastifyReply } from "fastify";
import medicalStoreService from "../services/medical_store.service";

class MedicalStoreController {

    // CREATE
    async createStore(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const store = await medicalStoreService.createStore(body);

            return reply.code(201).send({
                success: true,
                message: "Medical store created successfully",
                data: store,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error creating medical store",
                error,
            });
        }
    }

    // GET ALL
    async getAllStores(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id,
            };

            const stores = await medicalStoreService.getAllStores(query);

            return reply.send({
                success: true,
                data: stores,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching medical stores",
                error,
            });
        }
    }

    // GET BY ID
    async getStoreById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const store = await medicalStoreService.getStoreById(id, client_id);

            if (!store) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical store not found",
                });
            }

            return reply.send({
                success: true,
                data: store,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching medical store",
                error,
            });
        }
    }

    // UPDATE
    async updateStore(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const store = await medicalStoreService.updateStore(id, body);

            if (!store) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical store not found for update",
                });
            }

            return reply.send({
                success: true,
                message: "Medical store updated successfully",
                data: store,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error updating medical store",
                error,
            });
        }
    }

    // DELETE
    async deleteStore(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const store = await medicalStoreService.getStoreById(id, client_id);
            if (!store) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical store not found",
                });
            }

            await medicalStoreService.deleteStore(id, client_id);

            return reply.send({
                success: true,
                message: "Medical store deleted successfully",
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error deleting medical store",
                error,
            });
        }
    }
}

export default new MedicalStoreController();
