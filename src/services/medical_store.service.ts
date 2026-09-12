import MedicalStoreModel from "../models/medical_store.model";
import { Op } from "sequelize";

class MedicalStoreService {

    // CREATE
    async createStore(data: any) {
        const store = await MedicalStoreModel.create({
            client_id: data.client_id,
            firm_name: data.firm_name,
            contact_person_name: data.contact_person_name ?? null,
            phone_number: data.phone_number,
            district: data.district,
            address: data.address,
            status: data.status !== undefined ? (data.status === "true" || data.status === true) : true,
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

        return stores;
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
