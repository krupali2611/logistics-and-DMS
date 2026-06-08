const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShipmentPackage = sequelize.define(
    'ShipmentPackage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      shipment_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      package_name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      package_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      weight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      length: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      width: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      height: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      declared_value: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true
      }
    },
    {
      tableName: 'shipment_packages'
    }
  );

  return ShipmentPackage;
};
