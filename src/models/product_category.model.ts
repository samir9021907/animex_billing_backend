import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ProductCategoryModel extends Model {
    public id!: string;
    public client_id!: string;
    public category_name!: string;
    public category_code!: string | null;
    public description!: string | null;
    public status!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;
}

ProductCategoryModel.init(
    {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        client_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: "clients",
                key: "id",
            },
        },
        category_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        category_code: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "product_categories",
        timestamps: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

export default ProductCategoryModel;
