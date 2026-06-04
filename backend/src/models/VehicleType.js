const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VehicleType = sequelize.define(
    'VehicleType',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      type_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      min_capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      max_capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      }
    },
    {
      tableName: 'vehicle_types'
    }
  );

  return VehicleType;
};
