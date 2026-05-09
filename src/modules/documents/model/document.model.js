const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["ID Proof", "Contract", "Educational", "Experience", "Payslip", "Other"], required: true },
    fileUrl: { type: String, required: true },
    fileSize: Number,
    fileType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Document", documentSchema);
