const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ShipmentAttachment = sequelize.define(
    'ShipmentAttachment',
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
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      file_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      uploaded_by: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      tableName: 'shipment_attachments',
      updatedAt: false
    }
  );

  return ShipmentAttachment;
};
