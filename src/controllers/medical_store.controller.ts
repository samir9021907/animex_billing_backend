import { FastifyRequest, FastifyReply } from "fastify";
import medicalStoreService from "../services/medical_store.service";
import { validatePhoneNumber, validateString } from "../utils/validation.util";

class MedicalStoreController {

    // CREATE
    async createStore(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const payload = (request.body as any) || {};

            // 1. Validate Firm Name
            const firmValidation = validateString(payload.firm_name, "Firm Name (मेडिकल स्टोअरचे नाव)", 2, 200, true);
            if (!firmValidation.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: firmValidation.error
                });
            }

            // 2. Validate Phone Number (must be exactly 10 digits starting with 6, 7, 8, 9)
            const phoneValidation = validatePhoneNumber(payload.phone_number, "Phone Number (फोन नंबर)", true);
            if (!phoneValidation.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: phoneValidation.error
                });
            }

            // 3. Optional Contact Person Name
            const contactValidation = validateString(payload.contact_person_name, "Contact Person Name", 2, 100, false);
            if (!contactValidation.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: contactValidation.error
                });
            }

            const body = {
                ...payload,
                client_id,
                firm_name: firmValidation.value,
                phone_number: phoneValidation.value,
                contact_person_name: contactValidation.value || null,
                district: payload.district ? String(payload.district).trim() : "Maharashtra",
                address: payload.address ? String(payload.address).trim() : null,
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
            const payload = (request.body as any) || {};
            const updateBody: any = { client_id };

            if (payload.firm_name !== undefined) {
                const firmValidation = validateString(payload.firm_name, "Firm Name (मेडिकल स्टोअरचे नाव)", 2, 200, true);
                if (!firmValidation.isValid) {
                    return reply.code(400).send({ success: false, message: firmValidation.error });
                }
                updateBody.firm_name = firmValidation.value;
            }

            if (payload.phone_number !== undefined) {
                const phoneValidation = validatePhoneNumber(payload.phone_number, "Phone Number (फोन नंबर)", true);
                if (!phoneValidation.isValid) {
                    return reply.code(400).send({ success: false, message: phoneValidation.error });
                }
                updateBody.phone_number = phoneValidation.value;
            }

            if (payload.contact_person_name !== undefined) {
                const contactValidation = validateString(payload.contact_person_name, "Contact Person Name", 2, 100, false);
                if (!contactValidation.isValid) {
                    return reply.code(400).send({ success: false, message: contactValidation.error });
                }
                updateBody.contact_person_name = contactValidation.value || null;
            }

            if (payload.district !== undefined) {
                updateBody.district = String(payload.district).trim();
            }

            if (payload.address !== undefined) {
                updateBody.address = String(payload.address).trim();
            }

            if (payload.status !== undefined) {
                updateBody.status = payload.status;
            }

            const store = await medicalStoreService.updateStore(id, updateBody);

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
