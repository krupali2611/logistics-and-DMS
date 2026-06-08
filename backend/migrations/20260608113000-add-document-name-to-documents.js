'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableNames = ['driver_documents', 'vehicle_documents', 'customer_documents'];

    await Promise.all(
      tableNames.map(async (tableName) => {
        const tableDefinition = await queryInterface.describeTable(tableName);

        if (!tableDefinition.document_name) {
          await queryInterface.addColumn(tableName, 'document_name', {
            type: Sequelize.STRING(100),
            allowNull: true
          });
        }
      })
    );
  },

  async down(queryInterface) {
    const tableNames = ['driver_documents', 'vehicle_documents', 'customer_documents'];

    await Promise.all(
      tableNames.map(async (tableName) => {
        const tableDefinition = await queryInterface.describeTable(tableName);

        if (tableDefinition.document_name) {
          await queryInterface.removeColumn(tableName, 'document_name');
        }
      })
    );
  }
};
