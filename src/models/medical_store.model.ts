import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class MedicalStoreModel extends Model {
    public id!: string;
    public client_id!: string;
    public firm_name!: string;
    public contact_person_name!: string | null;
    public phone_number!: string;
    public district!: string;
    public address!: string;
    public status!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;
}

MedicalStoreModel.init(
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
        firm_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        contact_person_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: "medical_stores",
        timestamps: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

export default MedicalStoreModel;
