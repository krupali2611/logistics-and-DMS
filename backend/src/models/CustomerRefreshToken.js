const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerRefreshToken = sequelize.define(
    'CustomerRefreshToken',
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
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: 'customer_refresh_tokens'
    }
  );

  return CustomerRefreshToken;
};
