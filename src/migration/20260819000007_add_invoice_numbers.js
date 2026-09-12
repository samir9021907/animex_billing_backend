'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'company_invoice_number', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('invoices', 'global_bill_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      unique: true
    });

    const [invoices] = await queryInterface.sequelize.query(
      'SELECT id, medical_store_id, invoice_number, created_at FROM invoices ORDER BY created_at ASC, id ASC'
    );
    const companyCounters = new Map();
    const usedGlobalIds = new Set();
    let nextGlobalId = 1;

    for (const invoice of invoices) {
      const companyNumber = (companyCounters.get(invoice.medical_store_id) || 0) + 1;
      companyCounters.set(invoice.medical_store_id, companyNumber);

      const parsedNumber = Number.parseInt(String(invoice.invoice_number || '').replace(/^#/, ''), 10);
      let globalNumber = Number.isInteger(parsedNumber) && parsedNumber > 0 && !usedGlobalIds.has(parsedNumber)
        ? parsedNumber
        : nextGlobalId;
      while (usedGlobalIds.has(globalNumber)) globalNumber += 1;
      usedGlobalIds.add(globalNumber);
      nextGlobalId = Math.max(nextGlobalId, globalNumber + 1);

      await queryInterface.sequelize.query(
        'UPDATE invoices SET company_invoice_number = :companyNumber, global_bill_id = :globalNumber WHERE id = :id',
        { replacements: { companyNumber, globalNumber, id: invoice.id } }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('invoices', 'company_invoice_number');
    await queryInterface.removeColumn('invoices', 'global_bill_id');
  }
};
