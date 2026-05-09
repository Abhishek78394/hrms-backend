const express = require("express");
const auth = require("../../../common/middleware/auth");
const allowRoles = require("../../../common/middleware/rbac");
const { ADMIN, HR } = require("../../../common/constants/roles");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse } = require("../../../common/utils/apiResponse");
const Employee = require("../../employees/model/employee.model");
const Attendance = require("../../attendance/model/attendance.model");
const Payroll = require("../../payroll/model/payroll.model");
const Performance = require("../../performance/model/performance.model");

const router = express.Router();
router.use(auth, allowRoles(ADMIN, HR));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [employees, attendance, payroll, performance] = await Promise.all([
      Employee.countDocuments({ deletedAt: null }),
      Attendance.countDocuments({ deletedAt: null }),
      Payroll.countDocuments({ deletedAt: null }),
      Performance.countDocuments({ deletedAt: null })
    ]);
    return successResponse(res, "Dashboard analytics", { employees, attendance, payroll, performance });
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
