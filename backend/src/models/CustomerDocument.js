const { DataTypes } = require('sequelize');
const {
  CUSTOMER_DOCUMENT_TYPES,
  CUSTOMER_VERIFICATION_STATUS
} = require('../constants/customerConstants');

module.exports = (sequelize) => {
  const CustomerDocument = sequelize.define(
    'CustomerDocument',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      document_type: {
        type: DataTypes.ENUM(...CUSTOMER_DOCUMENT_TYPES),
        allowNull: false
      },
      document_number: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      document_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      document_file: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      verification_status: {
        type: DataTypes.ENUM(...CUSTOMER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'customer_documents'
    }
  );

  return CustomerDocument;
};
