const AuditLog = require("../database/auditLog.model");

const auditLog = (moduleName, action) => async (req, res, next) => {
  try {
    await AuditLog.create({
      action,
      module: moduleName,
      actorId: req.user?.sub,
      targetId: req.params.id,
      metadata: { body: req.body, query: req.query },
      ipAddress: req.ip
    });
  } catch (error) {
    // Logging should not fail the main business operation.
  }
  next();
};

module.exports = auditLog;
