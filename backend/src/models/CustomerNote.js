const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerNote = sequelize.define(
    'CustomerNote',
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
      note: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {
      tableName: 'customer_notes'
    }
  );

  return CustomerNote;
};
