const { DataTypes } = require('sequelize');
const {
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_VERIFICATION_STATUS
} = require('../constants/vehicleConstants');

module.exports = (sequelize) => {
  const VehicleDocument = sequelize.define(
    'VehicleDocument',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      document_type: {
        type: DataTypes.ENUM(...VEHICLE_DOCUMENT_TYPES),
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
        type: DataTypes.ENUM(...VEHICLE_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'vehicle_documents'
    }
  );

  return VehicleDocument;
};
