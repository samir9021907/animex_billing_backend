import MedicalStoreModel from "../models/medical_store.model";
import { Op } from "sequelize";

class MedicalStoreService {

    // CREATE
    async createStore(data: any) {
        const cleanName = data.firm_name ? String(data.firm_name).trim() : "";
        if (!cleanName) {
            throw new Error("Firm name is required");
        }
        const customerType = (data.customer_type === 'customer' || data.customerType === 'customer') ? 'customer' : 'store';

        if (data.client_id) {
            const existing = await MedicalStoreModel.findOne({
                where: {
                    client_id: data.client_id,
                    firm_name: {
                        [Op.iLike]: cleanName
                    }
                }
            });
            if (existing) {
                const updates: any = {};
                if (existing.customer_type !== customerType) updates.customer_type = customerType;
                if (data.phone_number && existing.phone_number !== data.phone_number) updates.phone_number = data.phone_number;
                if (data.address && existing.address !== data.address) updates.address = data.address;
                if (data.district && existing.district !== data.district) updates.district = data.district;
                if (data.contact_person_name && existing.contact_person_name !== data.contact_person_name) updates.contact_person_name = data.contact_person_name;
                if (Object.keys(updates).length > 0) {
                    await existing.update(updates);
                }
                return existing;
            }
        }

        const store = await MedicalStoreModel.create({
            client_id: data.client_id,
            firm_name: cleanName,
            contact_person_name: data.contact_person_name ?? null,
            phone_number: data.phone_number,
            district: data.district,
            address: data.address,
            status: data.status !== undefined ? (data.status === "true" || data.status === true) : true,
            customer_type: customerType,
        });

        return store;
    }

    // GET ALL WITH FILTERS
    async getAllStores(query: any) {
        const whereCondition: any = {};

        if (query.client_id) {
            whereCondition.client_id = query.client_id;
        }

        if (query.firm_name) {
            whereCondition.firm_name = {
                [Op.iLike]: `%${query.firm_name}%`
            };
        }

        if (query.district) {
            whereCondition.district = {
                [Op.iLike]: `%${query.district}%`
            };
        }

        if (query.status !== undefined) {
            whereCondition.status = query.status === "true" || query.status === true;
        }

        const stores = await MedicalStoreModel.findAll({
            where: whereCondition,
            order: [["created_at", "DESC"]],
        });

        // Guaranteed deduplication: never return two stores/customers with identical name
        const seenNames = new Set<string>();
        const uniqueStores: any[] = [];
        for (const s of stores) {
            const key = (s.firm_name || "").trim().toLowerCase();
            if (key && !seenNames.has(key)) {
                seenNames.add(key);
                uniqueStores.push(s);
            }
        }

        return uniqueStores;
    }

    // GET BY ID
    async getStoreById(id: string, clientId?: string) {
        const whereCondition: any = { id };

        if (clientId) {
            whereCondition.client_id = clientId;
        }

        return await MedicalStoreModel.findOne({
            where: whereCondition,
        });
    }

    // UPDATE
    async updateStore(id: string, data: any) {
        const updateData: any = {};

        if (data.firm_name !== undefined) updateData.firm_name = data.firm_name;
        if (data.contact_person_name !== undefined) updateData.contact_person_name = data.contact_person_name;
        if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
        if (data.district !== undefined) updateData.district = data.district;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.status !== undefined) {
            updateData.status = data.status === "true" || data.status === true;
        }
        if (data.customer_type !== undefined || data.customerType !== undefined) {
            updateData.customer_type = (data.customer_type === 'customer' || data.customerType === 'customer') ? 'customer' : 'store';
        }

        await MedicalStoreModel.update(updateData, {
            where: data.client_id ? { id, client_id: data.client_id } : { id },
        });

        return await this.getStoreById(id, data.client_id);
    }

    // DELETE
    async deleteStore(id: string, clientId?: string) {
        await MedicalStoreModel.destroy({
            where: clientId ? { id, client_id: clientId } : { id },
        });

        return true;
    }
}

export default new MedicalStoreService();
