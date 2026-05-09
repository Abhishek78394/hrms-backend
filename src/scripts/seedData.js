const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Employee = require("../modules/employees/model/employee.model");
const User = require("../modules/users/model/user.model");
const Attendance = require("../modules/attendance/model/attendance.model");
const Leave = require("../modules/leaves/model/leave.model");
const Payroll = require("../modules/payroll/model/payroll.model");
const Document = require("../modules/documents/model/document.model");

const MONGO_URI = "mongodb://abhi78394hk_db_user:Abhishek@ac-zfbexfj-shard-00-00.togvnaz.mongodb.net:27017,ac-zfbexfj-shard-00-01.togvnaz.mongodb.net:27017,ac-zfbexfj-shard-00-02.togvnaz.mongodb.net:27017/hrms?ssl=true&authSource=admin";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const usersToCreate = [
      { firstName: "Amit", lastName: "Sharma", email: "amit@example.com", role: "Employee" },
      { firstName: "Priya", lastName: "Patel", email: "priya@example.com", role: "Employee" },
      { firstName: "Raj", lastName: "Malhotra", email: "raj@example.com", role: "Employee" },
      { firstName: "Sanya", lastName: "Verma", email: "sanya@example.com", role: "Employee" },
      { firstName: "Vikram", lastName: "Singh", email: "vikram@example.com", role: "Employee" },
      { firstName: "Neha", lastName: "Gupta", email: "neha@example.com", role: "HR" },
      { firstName: "Karan", lastName: "Mehta", email: "karan@example.com", role: "HR" },
    ];

    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    for (const u of usersToCreate) {
      console.log(`Creating data for ${u.firstName} ${u.lastName}...`);
      
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          ...u,
          password: "Password123",
          status: "active"
        });
      }

      let emp = await Employee.findOne({ email: u.email });
      if (!emp) {
        emp = await Employee.create({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          userId: user._id,
          department: u.role === "HR" ? "Human Resources" : "Engineering",
          designation: u.role === "HR" ? "HR Manager" : "Software Engineer",
          salary: u.role === "HR" ? 65000 : 50000,
          joiningDate: sixMonthsAgo,
          status: "Active"
        });
      }

      const attendanceRecords = [];
      let tempDate = new Date(sixMonthsAgo);
      while (tempDate <= today) {
        if (tempDate.getDay() !== 0 && tempDate.getDay() !== 6) {
          const dateStr = tempDate.toISOString().split("T")[0];
          const isPresent = Math.random() > 0.1;
          if (isPresent) {
            const checkIn = new Date(tempDate);
            checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
            const checkOut = new Date(tempDate);
            checkOut.setHours(18, Math.floor(Math.random() * 30), 0);
            const workMinutes = Math.floor((checkOut - checkIn) / (1000 * 60));
            attendanceRecords.push({
              employeeId: emp._id,
              date: dateStr,
              checkIn,
              checkOut,
              workMinutes,
              status: Math.random() > 0.1 ? "present" : "late"
            });
          } else {
            attendanceRecords.push({ employeeId: emp._id, date: dateStr, status: "absent" });
          }
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      await Attendance.deleteMany({ employeeId: emp._id });
      await Attendance.insertMany(attendanceRecords);

      await Leave.deleteMany({ employeeId: emp._id });
      await Leave.create({
        employeeId: emp._id,
        type: "casual",
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
        endDate: new Date(today.getFullYear(), today.getMonth() - 1, 12),
        reason: "Personal work",
        status: "approved",
        appliedOn: new Date()
      });

      await Payroll.deleteMany({ employeeId: emp._id });
      const payslips = [];
      for (let i = 1; i <= 6; i++) {
        const payDate = new Date(today);
        payDate.setMonth(today.getMonth() - i);
        const monthStr = `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, "0")}`;
        payslips.push({
          employeeId: emp._id,
          month: monthStr,
          basicSalary: emp.salary,
          allowances: 5000,
          deductions: 2000,
          netSalary: emp.salary + 5000 - 2000,
          status: "paid",
          paymentDate: new Date(payDate.getFullYear(), payDate.getMonth(), 28)
        });
      }
      await Payroll.insertMany(payslips);

      await Document.deleteMany({ employeeId: emp._id });
      await Document.create([
        {
          employeeId: emp._id,
          title: "Aadhar Card",
          type: "ID Proof",
          fileUrl: "https://example.com/aadhar.pdf",
          uploadedBy: user._id
        },
        {
          employeeId: emp._id,
          title: "Offer Letter",
          type: "Other",
          fileUrl: "https://example.com/offer.pdf",
          uploadedBy: user._id
        }
      ]);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
