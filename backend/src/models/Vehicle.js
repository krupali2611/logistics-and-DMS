const { DataTypes } = require('sequelize');
const {
  VEHICLE_STATUS,
  VEHICLE_VERIFICATION_STATUS,
  VEHICLE_AVAILABILITY_STATUS
} = require('../constants/vehicleConstants');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define(
    'Vehicle',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vehicle_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      vehicle_type_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      brand: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      manufacturing_year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fuel_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      insurance_number: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      insurance_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      registration_number: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      registration_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      assigned_driver_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...VEHICLE_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      verification_status: {
        type: DataTypes.ENUM(...VEHICLE_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      availability_status: {
        type: DataTypes.ENUM(...VEHICLE_AVAILABILITY_STATUS),
        allowNull: false,
        defaultValue: 'AVAILABLE'
      }
    },
    {
      tableName: 'vehicles'
    }
  );

  return Vehicle;
};
