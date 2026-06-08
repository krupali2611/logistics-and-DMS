const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      tableName: 'audit_logs'
    }
  );

  return AuditLog;
};
