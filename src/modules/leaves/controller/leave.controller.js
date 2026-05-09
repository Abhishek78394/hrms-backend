const Leave = require("../model/leave.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const applyLeave = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason, supportingDocument } = req.body;
  
  // 1. Find the Employee record associated with this User
  const employee = await Employee.findOne({ email: req.user.email });
  
  if (!employee) {
    return errorResponse(res, "Employee profile not found. Please contact HR.", 404);
  }

  // 2. Create the Leave record with the correct Employee ObjectId
  const leave = await Leave.create({
    employeeId: employee._id,
    type,
    startDate,
    endDate,
    reason,
    supportingDocument, // Save the document
    status: "pending"
  });

  return successResponse(res, "Leave applied successfully", leave);
});

const listLeaves = asyncHandler(async (req, res) => {
  const { status, self } = req.query;
  const filter = {};
  
  // If user is an Employee, or self=true is passed, only show their own leaves
  if (req.user.role === "Employee" || self === "true") {
    const employee = await Employee.findOne({ email: req.user.email });
    if (employee) filter.employeeId = employee._id;
  } else {
    // Admin and HR should see all leaves
    // No specific filter needed for now
  }
  
  if (status) filter.status = status;

  const leaves = await Leave.find(filter)
    .select("-supportingDocument")
    .populate("employeeId", "firstName lastName employeeId email")
    .sort("-appliedOn");
    
  try {
    const fs = require('fs');
    fs.appendFileSync('./logs/debug.log', `[listLeaves] Role: ${req.user.role}, Email: ${req.user.email}, Filter: ${JSON.stringify(filter)}, Results: ${leaves.length}\n`);
  } catch(e) {}

  return successResponse(res, "Leave applications", leaves);
});

const actionLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;

  const leave = await Leave.findById(id).populate("employeeId");
  if (!leave) return errorResponse(res, "Leave not found", 404);

  // Prevent HR from approving/rejecting their own leave
  if (req.user.role === "HR" && leave.employeeId.email === req.user.email) {
    return errorResponse(res, "You cannot approve or reject your own leave request.", 403);
  }

  leave.status = status;
  leave.comments = comments;
  leave.actionedOn = new Date();
  leave.actionedBy = req.user._id;
  await leave.save();

  return successResponse(res, `Leave ${status} successfully`, leave);
});

const getLeaveBalance = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ email: req.user.email });
  
  if (!employee) {
    return errorResponse(res, "Employee profile not found.", 404);
  }

  // Find all approved leaves for this employee
  const leaves = await Leave.find({ 
    employeeId: employee._id, 
    status: "approved",
    deletedAt: null 
  });

  // Default annual allocations
  const balances = {
    vacation: { total: 20, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 10, used: 0 },
    emergency: { total: 5, used: 0 }
  };

  leaves.forEach(l => {
    // Calculate days between start and end date (inclusive)
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (balances[l.type]) {
      balances[l.type].used += diffDays;
    }
  });

  return successResponse(res, "Leave balances", balances);
});

module.exports = { applyLeave, listLeaves, actionLeave, getLeaveBalance };
