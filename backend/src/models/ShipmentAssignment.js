const { DataTypes } = require('sequelize');
const {
  SHIPMENT_ASSIGNMENT_TYPES,
  SHIPMENT_ASSIGNMENT_STATUSES
} = require('../constants/shipmentConstants');

module.exports = (sequelize) => {
  const ShipmentAssignment = sequelize.define(
    'ShipmentAssignment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      shipment_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      assignment_type: {
        type: DataTypes.ENUM(...SHIPMENT_ASSIGNMENT_TYPES),
        allowNull: false,
        defaultValue: 'MANUAL'
      },
      status: {
        type: DataTypes.ENUM(...SHIPMENT_ASSIGNMENT_STATUSES),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      assigned_by: {
        type: DataTypes.UUID,
        allowNull: true
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      auto_assignment_score: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'shipment_assignments'
    }
  );

  return ShipmentAssignment;
};
