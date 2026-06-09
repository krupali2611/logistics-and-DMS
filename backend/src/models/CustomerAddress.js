const { DataTypes } = require('sequelize');
const { CUSTOMER_ADDRESS_TYPES } = require('../constants/customerConstants');

module.exports = (sequelize) => {
  const CustomerAddress = sequelize.define(
    'CustomerAddress',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      address_type: {
        type: DataTypes.ENUM(...CUSTOMER_ADDRESS_TYPES),
        allowNull: false
      },
      address_line_1: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      address_line_2: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      landmark: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      pincode: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      place_id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      formatted_address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_favorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'customer_addresses'
    }
  );

  return CustomerAddress;
};
