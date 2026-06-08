const { DataTypes } = require('sequelize');
const { SHIPMENT_STATUSES } = require('../constants/shipmentConstants');

module.exports = (sequelize) => {
  const ShipmentStatusHistory = sequelize.define(
    'ShipmentStatusHistory',
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
      old_status: {
        type: DataTypes.ENUM(...SHIPMENT_STATUSES),
        allowNull: true
      },
      new_status: {
        type: DataTypes.ENUM(...SHIPMENT_STATUSES),
        allowNull: false
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      tableName: 'shipment_status_history',
      updatedAt: false
    }
  );

  return ShipmentStatusHistory;
};
