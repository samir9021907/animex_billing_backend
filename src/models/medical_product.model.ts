import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import ProductCategoryModel from "./product_category.model";

class MedicalProductModel extends Model {
    public id!: string;
    public client_id!: string;
    public category_id!: string;
    public product_title!: string;
    public unit!: "Ltr" | "ml" | "Kg" | "gm" | "Piece" | "Box" | "Bottle" | "Strip" | "Tablet";
    public mrp!: number;
    public selling_price!: number;
    public quantity!: number;
    public status!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;
}

MedicalProductModel.init(
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
        category_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: "product_categories",
                key: "id",
            },
        },
        product_title: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        unit: {
            type: DataTypes.ENUM(
                "Ltr",
                "ml",
                "Kg",
                "gm",
                "Piece",
                "Box",
                "Bottle",
                "Strip",
                "Tablet"
            ),
            allowNull: false,
        },
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        selling_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "medical_products",
        timestamps: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

// Associations
MedicalProductModel.belongsTo(ProductCategoryModel, {
    foreignKey: "category_id",
    as: "category",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
});

ProductCategoryModel.hasMany(MedicalProductModel, {
    foreignKey: "category_id",
    as: "products",
});

export default MedicalProductModel;
