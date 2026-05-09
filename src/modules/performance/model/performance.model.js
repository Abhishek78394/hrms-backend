const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewDate: { type: Date, default: Date.now },
    period: String, // e.g., "Q1 2026"
    ratings: {
      workQuality: { type: Number, min: 1, max: 5 },
      attendance: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 }
    },
    averageRating: Number,
    feedback: String,
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Performance", performanceSchema);
