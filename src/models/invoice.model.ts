import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import ClientModel from "./client.model";
import MedicalStoreModel from "./medical_store.model";

class InvoiceModel extends Model {
    public id!: string;
    public client_id!: string;
    public medical_store_id!: string;
    public invoice_number!: string;
    public company_invoice_number!: number | null;
    public global_bill_id!: number | null;
    public date!: Date;
    public items!: any; // JSON array of items
    public subtotal!: number;
    public discount!: number;
    public gst_rate!: number;
    public gst_amount!: number;
    public taxable_amount!: number;
    public round_off!: number;
    public grand_total!: number;
    public received_amount!: number;
    public balance_due!: number;
    public payment_type!: "Cash" | "UPI" | "Card" | "Credit";
    public status!: "Paid" | "Pending" | "Partially Paid" | "Cancelled";
    public notes!: string | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;
}

InvoiceModel.init(
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
        medical_store_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: "medical_stores",
                key: "id",
            },
        },
        invoice_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        company_invoice_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        global_bill_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        items: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        gst_rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 5.0,
        },
        gst_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        taxable_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        round_off: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        grand_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        received_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        balance_due: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        payment_type: {
            type: DataTypes.ENUM("Cash", "UPI", "Card", "Credit"),
            allowNull: false,
            defaultValue: "UPI",
        },
        status: {
            type: DataTypes.ENUM("Paid", "Pending", "Partially Paid", "Cancelled"),
            allowNull: false,
            defaultValue: "Pending",
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "invoices",
        timestamps: true,
        paranoid: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
    }
);

// Associations
InvoiceModel.belongsTo(ClientModel, {
    foreignKey: "client_id",
    as: "client",
});

InvoiceModel.belongsTo(MedicalStoreModel, {
    foreignKey: "medical_store_id",
    as: "medical_store",
});

MedicalStoreModel.hasMany(InvoiceModel, {
    foreignKey: "medical_store_id",
    as: "invoices",
});

export default InvoiceModel;
