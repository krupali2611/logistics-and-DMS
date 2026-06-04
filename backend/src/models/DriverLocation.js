const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DriverLocation = sequelize.define(
    'DriverLocation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'driver_locations'
    }
  );

  return DriverLocation;
};
