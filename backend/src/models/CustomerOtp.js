const { DataTypes } = require('sequelize');
const { CUSTOMER_OTP_TYPES } = require('../constants/customerAuthConstants');

module.exports = (sequelize) => {
  const CustomerOtp = sequelize.define(
    'CustomerOtp',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      otp: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(...CUSTOMER_OTP_TYPES),
        allowNull: false
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'customer_otps'
    }
  );

  return CustomerOtp;
};
