const mongoose = require("mongoose");
const User = require("./src/modules/users/model/user.model");
const Employee = require("./src/modules/employees/model/employee.model");
require("dotenv").config();

async function fix() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/hrms";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const employees = await Employee.find({});
  for (const emp of employees) {
    const user = await User.findOne({ email: emp.email });
    if (user) {
      emp.userId = user._id;
      if (emp.status === "active") emp.status = "Active";
      await emp.save();
      console.log(`Linked ${emp.email} to User ${user._id}`);
    } else {
      console.log(`No User found for ${emp.email}`);
    }
  }

  await mongoose.disconnect();
}

fix();
