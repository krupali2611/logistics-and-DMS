'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('driver_documents', 'document_name', {
        type: Sequelize.STRING(100),
        allowNull: true
      }),
      queryInterface.addColumn('vehicle_documents', 'document_name', {
        type: Sequelize.STRING(100),
        allowNull: true
      }),
      queryInterface.addColumn('customer_documents', 'document_name', {
        type: Sequelize.STRING(100),
        allowNull: true
      })
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('driver_documents', 'document_name'),
      queryInterface.removeColumn('vehicle_documents', 'document_name'),
      queryInterface.removeColumn('customer_documents', 'document_name')
    ]);
  }
};
