const { DataTypes } = require('sequelize');
const {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS
} = require('../constants/customerConstants');

module.exports = (sequelize) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      customer_type: {
        type: DataTypes.ENUM(...CUSTOMER_TYPES),
        allowNull: false
      },
      company_name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      contact_person: {
        type: DataTypes.STRING(150),
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
      alternate_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      gst_number: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      pan_number: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...CUSTOMER_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      verification_status: {
        type: DataTypes.ENUM(...CUSTOMER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      }
    },
    {
      tableName: 'customers'
    }
  );

  return Customer;
};
