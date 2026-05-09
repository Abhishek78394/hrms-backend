const mongoose = require("mongoose");

const complianceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["PF", "ESIC", "Tax", "Insurance", "Policy"], required: true },
    description: String,
    dueDate: Date,
    status: { type: String, enum: ["compliant", "non-compliant", "pending"], default: "pending" },
    records: [
      {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        acknowledgedOn: Date,
        status: String
      }
    ],
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Compliance", complianceSchema);
