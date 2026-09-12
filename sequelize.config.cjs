require('dotenv').config();

const common = {
  url: process.env.DATABASE_URL,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'animex_backend',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: false,
  migrationStorageTableName: 'sequelize_meta',
  seederStorageTableName: 'sequelize_seed_meta',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development: common,
  test: {
    ...common,
    database: `${common.database}_test`
  },
  production: common
};
