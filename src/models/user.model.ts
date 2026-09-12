import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import { ROLES_LIST } from "../utils/roles-constant";

class UserModel extends Model {
    public id!: string;
    public client_id!: string | null;
    public name!: string;
    public email!: string | null;
    public password!: string | null;
    public phone!: string | null;
    public role!: string;
    public enabled!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

UserModel.init(
    {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        client_id: {
            type: DataTypes.CHAR(36),
            allowNull: true,
            defaultValue: null,
            references: {
                model: "clients",
                key: "id",
            },
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(30),
            allowNull: true,
            unique: true,
        },
        role: {
            type: DataTypes.STRING(50),
            defaultValue: "businessowner",
            validate: {
                isIn: [ROLES_LIST]
            }
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        tableName: "users",
        timestamps: false,
    }
);

export default UserModel;
