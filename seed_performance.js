const mongoose = require("mongoose");
const PerformanceReview = require("./src/modules/performance/model/performanceReview.model");
const Employee = require("./src/modules/employees/model/employee.model");
const User = require("./src/modules/users/model/user.model");

const MONGO_URI = "mongodb://abhi78394hk_db_user:Abhishek@ac-zfbexfj-shard-00-00.togvnaz.mongodb.net:27017,ac-zfbexfj-shard-00-01.togvnaz.mongodb.net:27017,ac-zfbexfj-shard-00-02.togvnaz.mongodb.net:27017/hrms?ssl=true&authSource=admin";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const employees = await Employee.find();
    const admin = await User.findOne({ role: "Admin" }) || await User.findOne();

    if (!admin) {
      console.log("No reviewer found!");
      process.exit(1);
    }

    const reviews = [];
    const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];

    for (const emp of employees) {
      console.log(`Generating reviews for ${emp.firstName}...`);
      await PerformanceReview.deleteMany({ employeeId: emp._id });
      
      for (const month of months) {
        const rating = 3 + Math.random() * 2;
        reviews.push({
          employeeId: emp._id,
          reviewerId: admin._id,
          reviewType: "Monthly",
          period: month,
          ratings: {
            workQuality: Math.floor(rating),
            productivity: Math.floor(rating),
            communication: Math.floor(rating),
            teamwork: Math.floor(rating),
            technicalSkills: Math.floor(rating),
            punctuality: Math.floor(rating)
          },
          averageRating: Number(rating.toFixed(2)),
          strengths: ["Fast learner", "Great team player", "High ownership"],
          improvements: ["Improve documentation", "Better time management"],
          managerFeedback: "Consistently delivering high-quality work. Great addition to the team.",
          status: "Submitted",
          recommendation: "None",
          badges: ["Team Player"]
        });
      }
    }

    await PerformanceReview.insertMany(reviews);
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
