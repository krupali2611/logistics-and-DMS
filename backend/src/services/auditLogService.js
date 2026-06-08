const db = require('../models');

const createAuditLog = async ({ action, entityType, entityId, performedBy, details }, options = {}) =>
  db.AuditLog.create(
    {
      action,
      entity_type: entityType,
      entity_id: entityId,
      performed_by: performedBy,
      details: details || null
    },
    options
  );

module.exports = {
  createAuditLog
};
