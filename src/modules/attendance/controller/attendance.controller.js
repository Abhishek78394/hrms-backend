const Attendance = require("../model/attendance.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");
const roles = require("../../../common/constants/roles");

const getEmployeeId = async (user) => {
  if (user.role === roles.ADMIN || user.role === roles.HR) {
    return null; // Admin/HR might be performing actions on behalf or viewing all
  }
  const employee = await Employee.findOne({ userId: user._id });
  return employee ? employee._id : null;
};

const checkIn = asyncHandler(async (req, res) => {
  let { employeeId } = req.body;
  
  // If not admin/hr, use the logged in user's employee record
  if (req.user.role === roles.EMPLOYEE || !employeeId) {
    let emp = await Employee.findOne({ userId: req.user._id });
    
    // Self-healing: If user is an employee but has no employee record, link or create one
    if (!emp) {
      const user = await require("../../users/model/user.model").findById(req.user._id);
      if (!user) return errorResponse(res, "User not found", 404);
      
      // Check if an employee record already exists with this email (prevent duplicate key error)
      emp = await Employee.findOne({ email: user.email.toLowerCase() });
      
      if (emp) {
        // Link the existing employee record to this user ID
        emp.userId = user._id;
        await emp.save();
      } else {
        // Create a new employee record if none exists
        emp = await Employee.create({
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: "Active"
        });
      }
    }
    employeeId = emp._id;
  }

  const date = new Date().toISOString().split("T")[0];

  let attendance = await Attendance.findOne({ employeeId, date });
  if (attendance) {
    return errorResponse(res, "Already checked in for today", 400);
  }

  try {
    attendance = await Attendance.create({
      employeeId,
      date,
      checkIn: new Date(),
      status: "present"
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, "Already checked in for today", 400);
    }
    throw error;
  }

  return successResponse(res, "Checked in successfully", attendance);
});

const checkOut = asyncHandler(async (req, res) => {
  let { employeeId } = req.body;

  if (req.user.role === roles.EMPLOYEE || !employeeId) {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return errorResponse(res, "Employee record not found", 404);
    employeeId = emp._id;
  }

  const date = new Date().toISOString().split("T")[0];

  const attendance = await Attendance.findOne({ employeeId, date });
  if (!attendance) {
    return errorResponse(res, "No check-in record found for today", 404);
  }

  if (attendance.checkOut) {
    return errorResponse(res, "Already checked out for today", 400);
  }

  attendance.checkOut = new Date();
  const diff = attendance.checkOut - attendance.checkIn;
  attendance.workMinutes = Math.floor(diff / 1000 / 60);
  await attendance.save();

  return successResponse(res, "Checked out successfully", attendance);
});

const listAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date } = req.query;
  const filter = { deletedAt: null };

  // If role is employee, they can only see their own attendance
  if (req.user.role === roles.EMPLOYEE) {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return successResponse(res, "Attendance logs (No employee record found)", []);
    filter.employeeId = emp._id;
  } else {
    // Admin/HR can filter by employeeId if provided
    if (employeeId) filter.employeeId = employeeId;
  }

  if (date) filter.date = date;

  const logs = await Attendance.find(filter)
    .populate("employeeId", "firstName lastName employeeId department designation")
    .sort("-date -createdAt");

  return successResponse(res, "Attendance logs", logs);
});

const exportAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date } = req.query;
  const filter = { deletedAt: null };

  if (req.user.role === roles.EMPLOYEE) {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return res.status(404).send("Employee record not found");
    filter.employeeId = emp._id;
  } else if (employeeId) {
    filter.employeeId = employeeId;
  }
  if (date) filter.date = date;

  const logs = await Attendance.find(filter)
    .populate("employeeId", "firstName lastName employeeId department")
    .sort("-date -createdAt");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=attendance_${new Date().toISOString().split("T")[0]}.csv`);

  const { Readable } = require("stream");
  const readable = new Readable({
    read() {
      this.push("Employee ID,Name,Department,Date,Check In,Check Out,Work Minutes,Status\n");
      logs.forEach(log => {
        const name = `${log.employeeId?.firstName || ""} ${log.employeeId?.lastName || ""}`.replace(/,/g, " ");
        const row = [
          log.employeeId?.employeeId || "N/A",
          name,
          log.employeeId?.department || "N/A",
          log.date,
          log.checkIn ? new Date(log.checkIn).toLocaleTimeString() : "-",
          log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "-",
          log.workMinutes || 0,
          log.status
        ].join(",") + "\n";
        this.push(row);
      });
      this.push(null);
    }
  });

  readable.pipe(res);
});

module.exports = { checkIn, checkOut, listAttendance, exportAttendance };


