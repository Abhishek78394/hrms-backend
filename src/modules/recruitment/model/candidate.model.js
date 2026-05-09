const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    resumeUrl: { type: String },
    source: { type: String, default: "Direct" }, // e.g. LinkedIn, Referral
    status: { 
      type: String, 
      enum: ["Applied", "Shortlisted", "Interviewing", "Offered", "Hired", "Rejected", "Withdrawn"], 
      default: "Applied",
      index: true
    },
    interviews: [{
      round: String,
      date: Date,
      interviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      feedback: String,
      rating: { type: Number, min: 1, max: 5 }
    }],
    overallFeedback: String,
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

// Virtual for full name
candidateSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});

candidateSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Candidate", candidateSchema);
