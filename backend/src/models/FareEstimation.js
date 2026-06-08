const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FareEstimation = sequelize.define(
    'FareEstimation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      shipment_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      vehicle_type_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      distance_km: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      weight_kg: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      base_fare: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      distance_charge: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      weight_charge: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      final_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      }
    },
    {
      tableName: 'fare_estimations'
    }
  );

  return FareEstimation;
};
