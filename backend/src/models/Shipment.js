const { DataTypes } = require('sequelize');
const {
  SHIPMENT_TYPES,
  SHIPMENT_PRIORITIES,
  SHIPMENT_STATUSES
} = require('../constants/shipmentConstants');

module.exports = (sequelize) => {
  const Shipment = sequelize.define(
    'Shipment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      shipment_number: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      pickup_address_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      pickup_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      pickup_address_snapshot: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      pickup_city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pickup_state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pickup_country: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      pickup_pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      delivery_address_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      delivery_address: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      delivery_address_snapshot: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      delivery_city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      delivery_state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      delivery_country: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      delivery_pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      pickup_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      pickup_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      delivery_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      delivery_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      pickup_place_id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      delivery_place_id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      vehicle_type_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      shipment_type: {
        type: DataTypes.ENUM(...SHIPMENT_TYPES),
        allowNull: false
      },
      priority: {
        type: DataTypes.ENUM(...SHIPMENT_PRIORITIES),
        allowNull: false,
        defaultValue: 'NORMAL'
      },
      package_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_weight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_volume: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      estimated_distance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
      route_distance_km: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
      route_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      estimated_eta: {
        type: DataTypes.DATE,
        allowNull: true
      },
      route_provider: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      route_geometry: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      estimated_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      special_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...SHIPMENT_STATUSES),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      cancelled_by: {
        type: DataTypes.UUID,
        allowNull: true
      },
      cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by_customer_user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      current_driver_latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      current_driver_longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      current_eta: {
        type: DataTypes.DATE,
        allowNull: true
      },
      current_location_updated_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true
      }
    },
    {
      tableName: 'shipments'
    }
  );

  return Shipment;
};
