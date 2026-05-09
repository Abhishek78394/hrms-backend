const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    deviceId: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true },
    isRevoked: { type: Boolean, default: false, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Session", sessionSchema);
