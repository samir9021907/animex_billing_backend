import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class ClientModel extends Model {
    public id!: string;
    public name!: string;
    public email!: string | null;
    public phone!: string | null;
    public address!: string | null;
    public city!: string | null;
    public status!: "active" | "inactive";
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

ClientModel.init(
    {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "active",
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "clients",
        timestamps: false,
    }
);

export default ClientModel;
