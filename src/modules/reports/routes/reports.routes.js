const express = require("express");
const auth = require("../../../common/middleware/auth");
const allowRoles = require("../../../common/middleware/rbac");
const { ADMIN, HR, EMPLOYEE } = require("../../../common/constants/roles");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse } = require("../../../common/utils/apiResponse");
const Employee = require("../../employees/model/employee.model");
const Attendance = require("../../attendance/model/attendance.model");
const Payroll = require("../../payroll/model/payroll.model");
const Performance = require("../../performance/model/performance.model");
const Leave = require("../../leaves/model/leave.model");

const router = express.Router();
router.use(auth, allowRoles(ADMIN, HR, EMPLOYEE));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    if (req.user.role === ADMIN || req.user.role === HR) {
      const [employees, attendance, payroll, performance] = await Promise.all([
        Employee.countDocuments({ deletedAt: null }),
        Attendance.countDocuments({ deletedAt: null }),
        Payroll.countDocuments({ deletedAt: null }),
        Performance.countDocuments({ deletedAt: null })
      ]);
      return successResponse(res, "Admin dashboard analytics", { employees, attendance, payroll, performance });
    } else {
      // Employee Specific Stats - Optimized
      const employee = await Employee.findOne({ userId: req.user._id, deletedAt: null }).select("_id firstName lastName").lean();
      if (!employee) return successResponse(res, "Employee not found", {});

      const [attendanceCount, totalDays, leaveAggregation, lastPayroll] = await Promise.all([
        Attendance.countDocuments({ employeeId: employee._id, status: "present", deletedAt: null }),
        Attendance.countDocuments({ employeeId: employee._id, deletedAt: null }),
        Leave.aggregate([
          { $match: { employeeId: employee._id, status: "approved", deletedAt: null } },
          {
            $group: {
              _id: null,
              totalDays: {
                $sum: {
                  $add: [{ $divide: [{ $subtract: ["$endDate", "$startDate"] }, 86400000] }, 1]
                }
              }
            }
          }
        ]),
        Payroll.findOne({ employeeId: employee._id, status: "paid", deletedAt: null })
          .sort("-month")
          .select("month")
          .lean()
      ]);

      const attendanceRate = totalDays > 0 ? Math.round((attendanceCount / totalDays) * 100) : 100;
      const approvedDays = leaveAggregation.length > 0 ? Math.ceil(leaveAggregation[0].totalDays) : 0;
      const leaveBalance = 24 - approvedDays;

      return successResponse(res, "Employee dashboard analytics", {
        myAttendance: `${attendanceRate}%`,
        leaveBalance: `${leaveBalance} Days`,
        upcomingReviews: 0,
        myPayslips: lastPayroll ? `${lastPayroll.month}` : "N/A"
      });
    }
  })
);

router.get(
  "/employees/csv",
  asyncHandler(async (req, res) => {
    const employees = await Employee.find({ deletedAt: null }).select("employeeId firstName lastName email department status");
    const rows = ["employeeId,firstName,lastName,email,department,status"];
    employees.forEach((e) =>
      rows.push(`${e.employeeId},${e.firstName},${e.lastName},${e.email},${e.department || ""},${e.status}`)
    );
    res.setHeader("Content-Type", "text/csv");
    return res.send(rows.join("\n"));
  })
);

module.exports = router;
