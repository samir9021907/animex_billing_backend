import { FastifyRequest, FastifyReply } from "fastify";
import productCategoryService from "../services/product_category.service";
import { validateString } from "../utils/validation.util";

class ProductCategoryController {

    // CREATE
    async createCategory(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const payload = (request.body as any) || {};

            const catVal = validateString(payload.category_name, "Category Name (कॅटेगरीचे नाव)", 2, 100, true);
            if (!catVal.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: catVal.error,
                });
            }

            const body = {
                ...payload,
                category_name: catVal.value,
                client_id,
            };

            const category = await productCategoryService.createCategory(body);

            return reply.code(201).send({
                success: true,
                message: "Product category created successfully",
                data: category,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error creating product category",
                error,
            });
        }
    }

    // GET ALL
    async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id,
            };

            const categories = await productCategoryService.getAllCategories(query);

            return reply.send({
                success: true,
                data: categories,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching product categories",
                error,
            });
        }
    }

    // GET BY ID
    async getCategoryById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const category = await productCategoryService.getCategoryById(id, client_id);

            if (!category) {
                return reply.code(404).send({
                    success: false,
                    message: "Product category not found",
                });
            }

            return reply.send({
                success: true,
                data: category,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching product category",
                error,
            });
        }
    }

    // UPDATE
    async updateCategory(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const payload = (request.body as any) || {};
            const updateBody: any = { client_id };

            if (payload.category_name !== undefined) {
                const catVal = validateString(payload.category_name, "Category Name", 2, 100, true);
                if (!catVal.isValid) {
                    return reply.code(400).send({ success: false, message: catVal.error });
                }
                updateBody.category_name = catVal.value;
            }

            if (payload.category_code !== undefined) updateBody.category_code = payload.category_code;
            if (payload.description !== undefined) updateBody.description = payload.description;
            if (payload.status !== undefined) updateBody.status = payload.status;

            const category = await productCategoryService.updateCategory(id, updateBody);

            if (!category) {
                return reply.code(404).send({
                    success: false,
                    message: "Product category not found for update",
                });
            }

            return reply.send({
                success: true,
                message: "Product category updated successfully",
                data: category,
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error updating product category",
                error,
            });
        }
    }

    // DELETE
    async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const category = await productCategoryService.getCategoryById(id, client_id);
            if (!category) {
                return reply.code(404).send({
                    success: false,
                    message: "Product category not found",
                });
            }

            await productCategoryService.deleteCategory(id, client_id);

            return reply.send({
                success: true,
                message: "Product category deleted successfully",
            });
        } catch (error) {
            return reply.code(500).send({
                success: false,
                message: "Error deleting product category",
                error,
            });
        }
    }
}

export default new ProductCategoryController();
