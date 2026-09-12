'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      client_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      unit: {
        type: Sequelize.ENUM('Ltr', 'ml', 'Kg', 'gm', 'Piece', 'Box', 'Bottle', 'Strip', 'Tablet'),
        allowNull: false
      },
      mrp: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      selling_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    };

    await queryInterface.createTable('products', tableDefinition);
    await queryInterface.createTable('medical_products', tableDefinition);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('medical_products');
    await queryInterface.dropTable('products');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_unit";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_medical_products_unit";');
  }
};
