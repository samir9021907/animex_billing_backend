import { FastifyRequest, FastifyReply } from "fastify";
import medicalProductService from "../services/medical_product.service";

class MedicalProductController {

    // CREATE
    async createProduct(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const product = await medicalProductService.createProduct(body);

            return reply.code(201).send({
                success: true,
                message: "Medical product created successfully",
                data: product,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error creating medical product",
                error,
            });
        }
    }

    // GET ALL
    async getAllProducts(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id,
            };

            const products = await medicalProductService.getAllProducts(query);

            return reply.send({
                success: true,
                data: products,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching medical products",
                error,
            });
        }
    }

    // GET BY ID
    async getProductById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const product = await medicalProductService.getProductById(id, client_id);

            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical product not found",
                });
            }

            return reply.send({
                success: true,
                data: product,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching medical product",
                error,
            });
        }
    }

    // UPDATE
    async updateProduct(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const body = {
                ...(request.body as any),
                client_id,
            };

            const product = await medicalProductService.updateProduct(id, body);

            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical product not found for update",
                });
            }

            return reply.send({
                success: true,
                message: "Medical product updated successfully",
                data: product,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error updating medical product",
                error,
            });
        }
    }

    // DELETE
    async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const product = await medicalProductService.getProductById(id, client_id);
            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical product not found",
                });
            }

            await medicalProductService.deleteProduct(id, client_id);

            return reply.send({
                success: true,
                message: "Medical product deleted successfully",
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error deleting medical product",
                error,
            });
        }
    }
    // UPDATE QUANTITY VIA RAW SQL (As requested)
    async updateProductQuantityRaw(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const { quantity } = request.body as { quantity: number };

            if (quantity === undefined || isNaN(quantity)) {
                return reply.code(400).send({
                    success: false,
                    message: "Invalid quantity parameter",
                });
            }

            const product = await medicalProductService.updateProductQuantityRaw(id, quantity, client_id);

            if (!product) {
                return reply.code(404).send({
                    success: false,
                    message: "Medical product not found for quantity update",
                });
            }

            return reply.send({
                success: true,
                message: "Product quantity updated successfully via SQL",
                data: product,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error updating quantity",
                error,
            });
        }
    }
}

export default new MedicalProductController();
