const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Counter = require("./counter.model");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, index: true, lowercase: true, unique: true },
    password: { type: String, select: false }, // Added password field to Employee collection
    phone: String,
    department: { type: String, index: true },
    designation: { type: String, index: true },
    salary: { type: Number, default: 0 },
    joiningDate: Date,
    about: String,
    address: String,
    emergencyContact: String,
    profileImage: String,
    role: { type: String, enum: ["Admin", "HR", "Employee"], default: "Employee" },
    status: { 
      type: String, 
      enum: ["Active", "Inactive", "On Leave", "Notice Period", "Resignation", "Termination", "Layoff", "Retirement", "Contract End", "Absconded", "Suspended", "Archived"], 
      default: "Active", 
      index: true 
    },
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

/**
 * Robust ID Generator
 */
async function getNextEmployeeId() {
  const allEmployees = await mongoose.model("Employee").find({}, { employeeId: 1 });
  let maxFound = 12;
  
  allEmployees.forEach(emp => {
    if (emp.employeeId) {
      const num = parseInt(emp.employeeId.split("-")[1]);
      if (!isNaN(num)) maxFound = Math.max(maxFound, num);
    }
  });

  const counter = await Counter.findByIdAndUpdate(
    { _id: "employeeId" },
    { $set: { seq: maxFound } },
    { new: true, upsert: true }
  );

  const updatedCounter = await Counter.findByIdAndUpdate(
    { _id: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true }
  );

  return `EMP-${updatedCounter.seq.toString().padStart(5, "0")}`;
}

employeeSchema.pre("save", async function(next) {
  // 1. Generate ID for new employees
  if (this.isNew && !this.employeeId) {
    try {
      this.employeeId = await getNextEmployeeId();
    } catch (error) {
      return next(error);
    }
  }

  // 2. Hash password if modified
  if (this.isModified("password") && this.password) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

employeeSchema.index({ firstName: "text", lastName: "text", email: "text", employeeId: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
