import MedicalProductModel from "../models/medical_product.model";
import ProductCategoryModel from "../models/product_category.model";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/db";

class MedicalProductService {

    // Helper to resolve or auto-create category
    async resolveCategoryId(clientId: string, categoryId?: string, categoryName?: string): Promise<string> {
        if (categoryId) {
            const existingCat = await ProductCategoryModel.findOne({
                where: { id: categoryId, client_id: clientId }
            });
            if (existingCat) return existingCat.id;
        }

        const name = (categoryName && categoryName.trim()) ? categoryName.trim() : "General";
        const [cat] = await ProductCategoryModel.findOrCreate({
            where: {
                client_id: clientId,
                category_name: { [Op.iLike]: name }
            },
            defaults: {
                client_id: clientId,
                category_name: name,
                status: true
            }
        });
        return cat.id;
    }

    // CREATE
    async createProduct(data: any) {
        const categoryId = await this.resolveCategoryId(data.client_id, data.category_id, data.category_name || data.category);

        // Check if product with same title already exists for this client (Idempotency)
        if (data.client_id && data.product_title) {
            const existing = await MedicalProductModel.findOne({
                where: {
                    client_id: data.client_id,
                    product_title: {
                        [Op.iLike]: data.product_title.trim()
                    }
                }
            });

            if (existing) {
                await existing.update({
                    category_id: categoryId,
                    unit: data.unit || existing.unit,
                    mrp: data.mrp !== undefined ? data.mrp : existing.mrp,
                    selling_price: data.selling_price !== undefined ? data.selling_price : existing.selling_price,
                    quantity: data.quantity !== undefined ? Number(data.quantity) : existing.quantity,
                    box_capacity: data.box_capacity !== undefined ? Number(data.box_capacity) : existing.box_capacity,
                    min_stock_alert: data.min_stock_alert !== undefined ? Number(data.min_stock_alert) : existing.min_stock_alert,
                    status: data.status !== undefined ? (data.status === "true" || data.status === true) : existing.status,
                });
                return await this.getProductById(existing.id, data.client_id);
            }
        }

        const product = await MedicalProductModel.create({
            client_id: data.client_id,
            category_id: categoryId,
            product_title: data.product_title ? data.product_title.trim() : data.product_title,
            unit: data.unit || "Ltr",
            mrp: data.mrp || 0,
            selling_price: data.selling_price || 0,
            quantity: data.quantity !== undefined ? Number(data.quantity) : 0,
            box_capacity: data.box_capacity !== undefined ? Number(data.box_capacity) : 50,
            min_stock_alert: data.min_stock_alert !== undefined ? Number(data.min_stock_alert) : 50,
            status: data.status !== undefined ? (data.status === "true" || data.status === true) : true,
        });

        return await this.getProductById(product.id, data.client_id);
    }

    // GET ALL WITH FILTERS
    async getAllProducts(query: any) {
        const whereCondition: any = {};

        if (query.client_id) {
            whereCondition.client_id = query.client_id;
        }

        if (query.category_id) {
            whereCondition.category_id = query.category_id;
        }

        if (query.product_title) {
            whereCondition.product_title = {
                [Op.iLike]: `%${query.product_title}%`
            };
        }

        if (query.status !== undefined) {
            whereCondition.status = query.status === "true" || query.status === true;
        }

        const products = await MedicalProductModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: ProductCategoryModel,
                    as: "category",
                    attributes: ["id", "category_name", "category_code"],
                }
            ],
            order: [["created_at", "DESC"]],
        });

        return products;
    }

    // GET BY ID
    async getProductById(id: string, clientId?: string) {
        const whereCondition: any = { id };

        if (clientId) {
            whereCondition.client_id = clientId;
        }

        return await MedicalProductModel.findOne({
            where: whereCondition,
            include: [
                {
                    model: ProductCategoryModel,
                    as: "category",
                    attributes: ["id", "category_name", "category_code"],
                }
            ],
        });
    }

    // UPDATE
    async updateProduct(id: string, data: any) {
        const updateData: any = {};

        if (data.category_id !== undefined || data.category_name || data.category) {
            updateData.category_id = await this.resolveCategoryId(data.client_id, data.category_id, data.category_name || data.category);
        }
        if (data.product_title !== undefined) updateData.product_title = data.product_title ? data.product_title.trim() : data.product_title;
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.mrp !== undefined) updateData.mrp = data.mrp;
        if (data.selling_price !== undefined) updateData.selling_price = data.selling_price;
        if (data.quantity !== undefined) updateData.quantity = Number(data.quantity);
        if (data.box_capacity !== undefined) updateData.box_capacity = Number(data.box_capacity);
        if (data.min_stock_alert !== undefined) updateData.min_stock_alert = Number(data.min_stock_alert);
        if (data.status !== undefined) {
            updateData.status = data.status === "true" || data.status === true;
        }

        await MedicalProductModel.update(updateData, {
            where: data.client_id ? { id, client_id: data.client_id } : { id },
        });

        return await this.getProductById(id, data.client_id);
    }

    // UPDATE QUANTITY VIA RAW SQL QUERY (As requested)
    async updateProductQuantityRaw(id: string, quantity: number, clientId?: string) {
        const query = clientId
            ? `UPDATE medical_products SET quantity = :quantity, updated_at = NOW() WHERE id = :id AND client_id = :clientId`
            : `UPDATE medical_products SET quantity = :quantity, updated_at = NOW() WHERE id = :id`;

        await sequelize.query(query, {
            replacements: { id, quantity: Number(quantity), clientId },
            type: QueryTypes.UPDATE
        });

        // Also update the products table for redundancy/compatibility
        const productsQuery = clientId
            ? `UPDATE products SET quantity = :quantity, updated_at = NOW() WHERE id = :id AND client_id = :clientId`
            : `UPDATE products SET quantity = :quantity, updated_at = NOW() WHERE id = :id`;

        await sequelize.query(productsQuery, {
            replacements: { id, quantity: Number(quantity), clientId },
            type: QueryTypes.UPDATE
        });

        return await this.getProductById(id, clientId);
    }

    // DELETE
    async deleteProduct(id: string, clientId?: string) {
        await MedicalProductModel.destroy({
            where: clientId ? { id, client_id: clientId } : { id },
        });

        return true;
    }
}

export default new MedicalProductService();
