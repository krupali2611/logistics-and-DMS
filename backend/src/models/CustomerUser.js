const { DataTypes } = require('sequelize');
const { CUSTOMER_USER_STATUSES } = require('../constants/customerAuthConstants');

module.exports = (sequelize) => {
  const CustomerUser = sequelize.define(
    'CustomerUser',
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
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING(100),
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
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      profile_image: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(...CUSTOMER_USER_STATUSES),
        allowNull: false,
        defaultValue: 'INACTIVE'
      },
      is_phone_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'customer_users',
      defaultScope: {
        attributes: {
          exclude: ['password']
        }
      },
      scopes: {
        withPassword: {
          attributes: {}
        }
      }
    }
  );

  return CustomerUser;
};
