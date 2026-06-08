const { DataTypes } = require('sequelize');

const DOCUMENT_TABLES = ['driver_documents', 'vehicle_documents', 'customer_documents'];
const DOCUMENT_NAME_COLUMN = 'document_name';

const ensureLegacyDocumentSchema = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  for (const tableName of DOCUMENT_TABLES) {
    const tableDefinition = await queryInterface.describeTable(tableName);

    if (tableDefinition[DOCUMENT_NAME_COLUMN]) {
      continue;
    }

    await queryInterface.addColumn(tableName, DOCUMENT_NAME_COLUMN, {
      type: DataTypes.STRING(100),
      allowNull: true
    });
  }
};

module.exports = {
  ensureLegacyDocumentSchema
};
