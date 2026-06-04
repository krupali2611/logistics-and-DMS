const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define(
    'Permission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: 'permissions'
    }
  );

  return Permission;
};
