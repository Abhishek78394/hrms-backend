const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    location: { type: String, default: "Remote" },
    type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Internship"], default: "Full-time" },
    experience: { type: String }, // e.g. "2-5 years"
    description: { type: String, required: true },
    requirements: [String],
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" }
    },
    status: { type: String, enum: ["Open", "Closed", "Draft"], default: "Open", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Job", jobSchema);
