import ClientModel from "../models/client.model";
import { Op } from "sequelize";

class ClientService {

    // CREATE
    async createClient(data: any) {
        const client = await ClientModel.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            status: data.status,
        });

        return client;
    }

    // GET ALL (WITH NAME FILTER)
    async getAllClients(query: any) {
        const whereCondition: any = {};

        if (query.name) {
            whereCondition.name = {
                [Op.iLike]: `%${query.name}%`
            };
        }

        if (query.status) {
            whereCondition.status = query.status;
        }

        const clients = await ClientModel.findAll({
            where: whereCondition,
            order: [["created_at", "DESC"]],
        });

        return clients;
    }

    // GET BY ID
    async getClientById(id: string) {
        return await ClientModel.findOne({
            where: { id }
        });
    }

    // UPDATE
    async updateClient(id: string, data: any) {
        await ClientModel.update(
            {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                status: data.status,
            },
            {
                where: { id }
            }
        );

        return await this.getClientById(id);
    }

    // DELETE
    async deleteClient(id: string) {
        await ClientModel.destroy({
            where: { id }
        });

        return true;
    }
}

export default new ClientService();
