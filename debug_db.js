require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/modules/users/model/user.model");
const Employee = require("./src/modules/employees/model/employee.model");
const env = require("./src/config/env");

async function debug() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/hrms";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const users = await User.find({}).lean();
  const employees = await Employee.find({}).lean();

  console.log("\n--- USERS ---");
  users.forEach(u => console.log(`${u._id} | ${u.email} | ${u.role}`));

  console.log("\n--- EMPLOYEES ---");
  employees.forEach(e => console.log(`${e._id} | ${e.email} | userId: ${e.userId}`));

  await mongoose.disconnect();
}

debug();
