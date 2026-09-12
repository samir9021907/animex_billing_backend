import UserModel from "../models/user.model";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

class UserService {

    // CREATE USER
    async createUser(data: any) {
        const { name, email, password, phone, role, client_id, enabled } = data;

        if (email) {
            const existingUser = await UserModel.findOne({ where: { email } });
            if (existingUser) {
                throw new Error("User already exists with this email");
            }
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const user = await UserModel.create({
            name,
            email: email ?? null,
            password: hashedPassword,
            phone: phone ?? null,
            role: role || "businessowner",
            client_id: client_id ?? null,
            enabled: enabled !== undefined ? enabled : true,
        });

        const userJson = user.toJSON() as any;
        delete userJson.password;
        return userJson;
    }

    // GET ALL USERS (WITH FILTERS)
    async getAllUsers(query: any) {
        const whereCondition: any = {};

        if (query.client_id) {
            whereCondition.client_id = query.client_id;
        }

        if (query.name) {
            whereCondition.name = {
                [Op.iLike]: `%${query.name}%`
            };
        }

        if (query.role) {
            whereCondition.role = query.role;
        }

        if (query.email) {
            whereCondition.email = {
                [Op.iLike]: `%${query.email}%`
            };
        }

        const users = await UserModel.findAll({
            where: whereCondition,
            attributes: { exclude: ["password"] },
            order: [["created_at", "DESC"]],
        });

        return users;
    }

    // GET USER BY ID
    async getUserById(id: string, clientId?: string) {
        const whereCondition: any = { id };

        if (clientId) {
            whereCondition.client_id = clientId;
        }

        return await UserModel.findOne({
            where: whereCondition,
            attributes: { exclude: ["password"] },
        });
    }

    // UPDATE USER
    async updateUser(id: string, data: any) {
        const updateData: any = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.enabled !== undefined) updateData.enabled = data.enabled;

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        await UserModel.update(updateData, {
            where: data.client_id ? { id, client_id: data.client_id } : { id },
        });

        return await this.getUserById(id, data.client_id);
    }

    // DELETE USER
    async deleteUser(id: string, clientId?: string) {
        await UserModel.destroy({
            where: clientId ? { id, client_id: clientId } : { id },
        });

        return true;
    }
}

export default new UserService();
