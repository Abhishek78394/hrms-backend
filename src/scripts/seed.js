require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../modules/users/model/user.model");
const Employee = require("../modules/employees/model/employee.model");

const run = async () => {
  await connectDB();
  let admin = await User.findOne({ email: "admin@hrms.local" });
  if (!admin) {
    admin = new User({
      firstName: "System",
      lastName: "Admin",
      email: "admin@hrms.local",
      password: "Admin@1234",
      role: "Admin",
      status: "active"
    });
  } else {
    admin.firstName = "System";
    admin.lastName = "Admin";
    admin.password = "Admin@1234";
    admin.role = "Admin";
    admin.status = "active";
  }
  await admin.save();

  await Employee.findOneAndUpdate(
    { employeeId: "EMP-0001" },
    {
      employeeId: "EMP-0001",
      firstName: "System",
      lastName: "Admin",
      email: "admin@hrms.local",
      department: "Administration",
      designation: "Admin",
      salary: 0,
      joiningDate: new Date(),
      role: "Admin",
      status: "active",
      userId: admin._id
    },
    { upsert: true, new: true }
  );

  await mongoose.connection.close();
};

run().then(() => process.exit(0));
