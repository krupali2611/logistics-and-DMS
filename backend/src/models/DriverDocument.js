const { DataTypes } = require('sequelize');
const {
  DRIVER_DOCUMENT_TYPES,
  DRIVER_VERIFICATION_STATUS
} = require('../constants/driverConstants');

module.exports = (sequelize) => {
  const DriverDocument = sequelize.define(
    'DriverDocument',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      document_type: {
        type: DataTypes.ENUM(...DRIVER_DOCUMENT_TYPES),
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
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      verification_status: {
        type: DataTypes.ENUM(...DRIVER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'driver_documents'
    }
  );

  return DriverDocument;
};
