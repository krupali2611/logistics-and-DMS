const { DataTypes } = require('sequelize');
const {
  DRIVER_STATUS,
  DRIVER_AVAILABILITY_STATUS,
  DRIVER_VERIFICATION_STATUS
} = require('../constants/driverConstants');

module.exports = (sequelize) => {
  const Driver = sequelize.define(
    'Driver',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      driver_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      gender: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      vehicle_assigned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      assigned_vehicle_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...DRIVER_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      availability_status: {
        type: DataTypes.ENUM(...DRIVER_AVAILABILITY_STATUS),
        allowNull: false,
        defaultValue: 'OFFLINE'
      },
      verification_status: {
        type: DataTypes.ENUM(...DRIVER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      }
    },
    {
      tableName: 'drivers'
    }
  );

  return Driver;
};
