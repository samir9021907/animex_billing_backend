'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add quantity column to medical_products table
    await queryInterface.addColumn('medical_products', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Add quantity column to products table for redundancy/compatibility
    await queryInterface.addColumn('products', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('medical_products', 'quantity');
    await queryInterface.removeColumn('products', 'quantity');
  }
};
