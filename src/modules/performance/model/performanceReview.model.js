const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reviewType: { type: String, enum: ["Monthly", "Quarterly", "Yearly"], default: "Monthly" },
    period: { type: String, required: true }, // e.g. "2026-05"
    
    // Ratings (1-5 scale)
    ratings: {
      workQuality: { type: Number, min: 1, max: 5, default: 3 },
      productivity: { type: Number, min: 1, max: 5, default: 3 },
      communication: { type: Number, min: 1, max: 5, default: 3 },
      teamwork: { type: Number, min: 1, max: 5, default: 3 },
      technicalSkills: { type: Number, min: 1, max: 5, default: 3 },
      punctuality: { type: Number, min: 1, max: 5, default: 3 }
    },
    
    averageRating: { type: Number, default: 0 },
    
    // Pros & Cons
    strengths: [String],
    improvements: [String],
    
    // Feedback
    managerFeedback: String,
    employeeSelfFeedback: String,
    
    // Goals
    goals: [{
      title: String,
      status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
      deadline: Date
    }],
    
    // HR Actions
    recommendation: { 
      type: String, 
      enum: ["None", "Promotion", "Salary Hike", "Training Required", "Under Observation"],
      default: "None"
    },
    
    badges: [{ type: String }], // e.g. "Employee of the Month", "Team Player"
    
    status: { type: String, enum: ["Draft", "Submitted", "Acknowledged"], default: "Submitted" },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

// Calculate average rating before save
performanceReviewSchema.pre("save", function(next) {
  const r = this.ratings;
  const vals = Object.values(r.toObject());
  const sum = vals.reduce((a, b) => a + b, 0);
  this.averageRating = Number((sum / vals.length).toFixed(2));
  next();
});

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
