const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, enum: ["full-time", "part-time", "contract"], default: "full-time" },
    location: { type: String, required: true },
    description: String,
    salaryRange: String,
    status: { type: String, enum: ["open", "closed", "on-hold"], default: "open", index: true },
    applicants: [
      {
        name: String,
        email: String,
        resume: String,
        status: { type: String, enum: ["pending", "shortlisted", "interviewed", "hired", "rejected"], default: "pending" },
        appliedOn: { type: Date, default: Date.now }
      }
    ],
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Recruitment", recruitmentSchema);
