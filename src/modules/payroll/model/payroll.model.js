const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: String, required: true }, // Format: YYYY-MM
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    totalWorkingHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    paymentDate: Date,
    paymentMethod: String,
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Payroll", payrollSchema);
