const { DataTypes } = require('sequelize');
const { VEHICLE_ASSIGNMENT_STATUS } = require('../constants/vehicleConstants');

module.exports = (sequelize) => {
  const VehicleAssignment = sequelize.define(
    'VehicleAssignment',
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
      driver_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      returned_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...VEHICLE_ASSIGNMENT_STATUS),
        allowNull: false,
        defaultValue: 'ASSIGNED'
      }
    },
    {
      tableName: 'vehicle_assignments'
    }
  );

  return VehicleAssignment;
};
