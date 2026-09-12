import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;

export const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'neondb',
      process.env.DB_USER || 'neondb_owner',
      process.env.DB_PASSWORD || 'npg_ZNtxSoV20lFK',
      {
        host: process.env.DB_HOST || 'ep-rough-sky-axiwu1ua-pooler.c-4.us-east-2.aws.neon.tech',
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};

export default sequelize;
