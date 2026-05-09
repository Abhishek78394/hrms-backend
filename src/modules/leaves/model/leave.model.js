const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: { type: String, enum: ["sick", "casual", "vacation", "emergency"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    appliedOn: { type: Date, default: Date.now },
    actionedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actionedOn: Date,
    comments: String,
    supportingDocument: String, // Base64 or URL to the uploaded file
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Leave", leaveSchema);
