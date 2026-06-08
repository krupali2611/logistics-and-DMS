const { DataTypes } = require('sequelize');
const { PRICING_RULE_STATUSES } = require('../constants/pricingConstants');

module.exports = (sequelize) => {
  const PricingRule = sequelize.define(
    'PricingRule',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vehicle_type_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      base_fare: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      per_km_rate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      per_kg_rate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      minimum_fare: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...PRICING_RULE_STATUSES),
        allowNull: false,
        defaultValue: 'ACTIVE'
      }
    },
    {
      tableName: 'pricing_rules'
    }
  );

  return PricingRule;
};
