import { FastifyRequest, FastifyReply } from "fastify";
import medicalProductService from "../services/medical_product.service";
import { validateString, validateNumber } from "../utils/validation.util";

class MedicalProductController {

    // CREATE
    async createProduct(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = (request.params as any) || {};
            const payload = (request.body as any) || {};
            const user = (request as any).user || {};
            const targetClientId = client_id || payload.client_id || user.client_id;

            if (!targetClientId) {
                return reply.code(400).send({
                    success: false,
                    message: "client_id is required (URL parameter, body, or auth token)",
                });
            }

            // 1. Validate Product Title
            const titleValidation = validateString(payload.product_title, "Product Title (प्रॉडक्टचे नाव)", 2, 250, true);
            if (!titleValidation.isValid) {
                return reply.code(400).send({ success: false, message: titleValidation.error });
            }

            // 2. Validate Selling Price (> 0)
            const priceValidation = validateNumber(payload.selling_price, "Selling Price (विक्री किंमत)", 0.01, 1000000, true);
            if (!priceValidation.isValid) {
                return reply.code(400).send({ success: false, message: priceValidation.error });
            }

            // 3. Validate MRP (>= 0)
            const mrpValidation = validateNumber(payload.mrp, "MRP", 0, 1000000, false);
            if (!mrpValidation.isValid) {
                return reply.code(400).send({ success: false, message: mrpValidation.error });
            }

            // Check MRP vs Selling Price
            if (mrpValidation.value! > 0 && mrpValidation.value! < priceValidation.value!) {
                return reply.code(400).send({
                    success: false,
                    message: "MRP cannot be less than selling price (MRP ही विक्री किंमतीपेक्षा कमी असू शकत नाही)"
                });
            }

            // 4. Validate Quantity (>= 0)
            const qtyValidation = validateNumber(payload.quantity, "Quantity (साठा संख्या)", 0, 10000000, false);
            if (!qtyValidation.isValid) {
                return reply.code(400).send({ success: false, message: qtyValidation.error });
            }

            // 5. Validate Box Capacity (>= 1)
            const boxValidation = validateNumber(payload.box_capacity, "Box Capacity (खोक्यात प्रमाण)", 1, 100000, false);
            if (!boxValidation.isValid) {
                return reply.code(400).send({ success: false, message: boxValidation.error });
            }

            const body = {
                ...payload,
                client_id: targetClientId,
                product_title: titleValidation.value,
                selling_price: priceValidation.value,
                mrp: mrpValidation.value,
                quantity: qtyValidation.value,
                box_capacity: boxValidation.value || 50,
                unit: payload.unit ? String(payload.unit).trim() : "Ltr",
                status: payload.status !== undefined ? (payload.status === "true" || payload.status === true) : true,
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
            const { client_id } = (request.params as any) || {};
            const queryParams = (request.query as any) || {};
            const targetClientId = client_id || queryParams.client_id;

            const query = {
                ...queryParams,
                ...(targetClientId ? { client_id: targetClientId } : {}),
            };

            const products = await medicalProductService.getAllProducts(query);

            return reply.send({
                success: true,
                count: products.length,
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
            const { id, client_id } = (request.params as any) || {};

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
            const { id, client_id } = (request.params as any) || {};
            const payload = (request.body as any) || {};
            const updateBody: any = client_id ? { client_id } : {};

            if (payload.product_title !== undefined) {
                const titleValidation = validateString(payload.product_title, "Product Title (प्रॉडक्टचे नाव)", 2, 250, true);
                if (!titleValidation.isValid) {
                    return reply.code(400).send({ success: false, message: titleValidation.error });
                }
                updateBody.product_title = titleValidation.value;
            }

            if (payload.selling_price !== undefined) {
                const priceValidation = validateNumber(payload.selling_price, "Selling Price (विक्री किंमत)", 0.01, 1000000, true);
                if (!priceValidation.isValid) {
                    return reply.code(400).send({ success: false, message: priceValidation.error });
                }
                updateBody.selling_price = priceValidation.value;
            }

            if (payload.mrp !== undefined) {
                const mrpValidation = validateNumber(payload.mrp, "MRP", 0, 1000000, false);
                if (!mrpValidation.isValid) {
                    return reply.code(400).send({ success: false, message: mrpValidation.error });
                }
                updateBody.mrp = mrpValidation.value;
            }

            if (payload.quantity !== undefined) {
                const qtyValidation = validateNumber(payload.quantity, "Quantity (साठा संख्या)", 0, 10000000, false);
                if (!qtyValidation.isValid) {
                    return reply.code(400).send({ success: false, message: qtyValidation.error });
                }
                updateBody.quantity = qtyValidation.value;
            }

            if (payload.box_capacity !== undefined) {
                const boxValidation = validateNumber(payload.box_capacity, "Box Capacity (खोक्यात प्रमाण)", 1, 100000, false);
                if (!boxValidation.isValid) {
                    return reply.code(400).send({ success: false, message: boxValidation.error });
                }
                updateBody.box_capacity = boxValidation.value;
            }

            if (payload.unit !== undefined) {
                updateBody.unit = String(payload.unit).trim();
            }

            if (payload.status !== undefined) {
                updateBody.status = payload.status;
            }

            if (payload.category_name !== undefined || payload.category !== undefined) {
                updateBody.category_name = payload.category_name || payload.category;
            }

            const product = await medicalProductService.updateProduct(id, updateBody);

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
            const { id, client_id } = (request.params as any) || {};

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
            const { id, client_id } = (request.params as any) || {};
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
