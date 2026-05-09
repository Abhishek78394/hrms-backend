const Attendance = require("../model/attendance.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const checkIn = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  const date = new Date().toISOString().split("T")[0];

  let attendance = await Attendance.findOne({ employeeId, date });
  if (attendance) {
    return errorResponse(res, "Already checked in for today", 400);
  }

  attendance = await Attendance.create({
    employeeId,
    date,
    checkIn: new Date(),
    status: "present"
  });

  return successResponse(res, "Checked in successfully", attendance);
});

const checkOut = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
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
  if (employeeId) filter.employeeId = employeeId;
  if (date) filter.date = date;

  const logs = await Attendance.find(filter)
    .populate("employeeId", "firstName lastName employeeId")
    .sort("-createdAt");

  return successResponse(res, "Attendance logs", logs);
});

module.exports = { checkIn, checkOut, listAttendance };
