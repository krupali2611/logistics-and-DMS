const { DataTypes } = require('sequelize');
const { DRIVER_VEHICLE_ASSIGNMENT_STATUS } = require('../constants/vehicleConstants');

module.exports = (sequelize) => {
  const DriverVehicleAssignment = sequelize.define(
    'DriverVehicleAssignment',
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
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      unassigned_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...DRIVER_VEHICLE_ASSIGNMENT_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      }
    },
    {
      tableName: 'driver_vehicle_assignments'
    }
  );

  return DriverVehicleAssignment;
};
