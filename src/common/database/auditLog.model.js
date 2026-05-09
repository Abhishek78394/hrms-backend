const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    targetId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: String
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
