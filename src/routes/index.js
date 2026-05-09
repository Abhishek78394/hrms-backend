const express = require("express");

const authRoutes = require("../modules/auth/routes/auth.routes");
const employeeRoutes = require("../modules/employees/routes/employee.routes");
const attendanceRoutes = require("../modules/attendance/routes/attendance.routes");
const leaveRoutes = require("../modules/leaves/routes/leaves.routes");
const payrollRoutes = require("../modules/payroll/routes/payroll.routes");
const recruitmentRoutes = require("../modules/recruitment/routes/recruitment.routes");
const performanceRoutes = require("../modules/performance/routes/performance.routes");
const documentsRoutes = require("../modules/documents/routes/documents.routes");
const complianceRoutes = require("../modules/compliance/routes/compliance.routes");
const reportsRoutes = require("../modules/reports/routes/reports.routes");

const router = express.Router();

router.get("/health", (req, res) => res.json({ success: true, message: "OK", data: {}, meta: {} }));
router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/payroll", payrollRoutes);
router.use("/recruitment", recruitmentRoutes);
router.use("/performance", performanceRoutes);
router.use("/documents", documentsRoutes);
router.use("/compliance", complianceRoutes);
router.use("/reports", reportsRoutes);

module.exports = router;
