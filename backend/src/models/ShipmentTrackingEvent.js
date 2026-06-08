const { DataTypes } = require('sequelize');
const { SHIPMENT_STATUSES, SHIPMENT_TRACKING_SOURCES } = require('../constants/shipmentConstants');

module.exports = (sequelize) => {
  const ShipmentTrackingEvent = sequelize.define(
    'ShipmentTrackingEvent',
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
      shipment_assignment_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false
      },
      location_label: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...SHIPMENT_STATUSES),
        allowNull: true
      },
      eta: {
        type: DataTypes.DATE,
        allowNull: true
      },
      source: {
        type: DataTypes.ENUM(...SHIPMENT_TRACKING_SOURCES),
        allowNull: false,
        defaultValue: 'SYSTEM'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      recorded_by: {
        type: DataTypes.UUID,
        allowNull: true
      },
      recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'shipment_tracking_events',
      createdAt: false,
      updatedAt: false
    }
  );

  return ShipmentTrackingEvent;
};
