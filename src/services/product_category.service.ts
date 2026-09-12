import ProductCategoryModel from "../models/product_category.model";
import { Op } from "sequelize";

class ProductCategoryService {

    // CREATE
    async createCategory(data: any) {
        const category = await ProductCategoryModel.create({
            client_id: data.client_id,
            category_name: data.category_name,
            category_code: data.category_code ?? null,
            description: data.description ?? null,
            status: data.status !== undefined ? (data.status === "true" || data.status === true) : true,
        });

        return category;
    }

    // GET ALL WITH FILTERS
    async getAllCategories(query: any) {
        const whereCondition: any = {};

        if (query.client_id) {
            whereCondition.client_id = query.client_id;
        }

        if (query.category_name) {
            whereCondition.category_name = {
                [Op.iLike]: `%${query.category_name}%`
            };
        }

        if (query.category_code) {
            whereCondition.category_code = {
                [Op.iLike]: `%${query.category_code}%`
            };
        }

        if (query.status !== undefined) {
            whereCondition.status = query.status === "true" || query.status === true;
        }

        const categories = await ProductCategoryModel.findAll({
            where: whereCondition,
            order: [["created_at", "DESC"]],
        });

        return categories;
    }

    // GET BY ID
    async getCategoryById(id: string, clientId?: string) {
        const whereCondition: any = { id };

        if (clientId) {
            whereCondition.client_id = clientId;
        }

        return await ProductCategoryModel.findOne({
            where: whereCondition,
        });
    }

    // UPDATE
    async updateCategory(id: string, data: any) {
        const updateData: any = {};

        if (data.category_name !== undefined) updateData.category_name = data.category_name;
        if (data.category_code !== undefined) updateData.category_code = data.category_code;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) {
            updateData.status = data.status === "true" || data.status === true;
        }

        await ProductCategoryModel.update(updateData, {
            where: data.client_id ? { id, client_id: data.client_id } : { id },
        });

        return await this.getCategoryById(id, data.client_id);
    }

    // DELETE
    async deleteCategory(id: string, clientId?: string) {
        await ProductCategoryModel.destroy({
            where: clientId ? { id, client_id: clientId } : { id },
        });

        return true;
    }
}

export default new ProductCategoryService();
