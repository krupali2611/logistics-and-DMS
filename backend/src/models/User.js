const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
        allowNull: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'users',
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

  return User;
};
