const Payroll = require("../model/payroll.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const generatePayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, basicSalary, allowances, deductions, isBulk } = req.body;
  
  if (isBulk) {
    const employees = await Employee.find({ status: "Active", deletedAt: null });
    let count = 0;
    for (const emp of employees) {
      const exists = await Payroll.findOne({ employeeId: emp._id, month, deletedAt: null });
      if (!exists) {
        await Payroll.create({
          employeeId: emp._id,
          month,
          basicSalary: emp.salary,
          allowances: allowances || 0,
          deductions: deductions || 0,
          netSalary: (emp.salary + (allowances || 0)) - (deductions || 0),
          status: "pending"
        });
        count++;
      }
    }
    return successResponse(res, `Bulk payroll generated for ${count} employees`, { count });
  }

  const netSalary = (basicSalary + allowances) - deductions;
  const payroll = await Payroll.create({
    employeeId, month, basicSalary, allowances, deductions, netSalary, status: "pending"
  });
  return successResponse(res, "Payroll generated successfully", payroll);
});

const listPayrolls = asyncHandler(async (req, res) => {
  const { employeeId, month } = req.query;
  const filter = { deletedAt: null };

  if (req.user.role === "Employee") {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return successResponse(res, "No payroll records found", []);
    filter.employeeId = emp._id;
  } else {
    if (employeeId) filter.employeeId = employeeId;
  }

  if (month) filter.month = month;

  const payrolls = await Payroll.find(filter)
    .populate("employeeId", "firstName lastName employeeId designation")
    .sort("-month");

  return successResponse(res, "Payroll records", payrolls);
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentMethod } = req.body;

  const payroll = await Payroll.findById(id);
  if (!payroll) return errorResponse(res, "Record not found", 404);

  payroll.status = status;
  if (status === "paid") {
    payroll.paymentDate = new Date();
    payroll.paymentMethod = paymentMethod;
  }
  await payroll.save();

  return successResponse(res, `Payroll marked as ${status}`, payroll);
});

module.exports = { generatePayroll, listPayrolls, updatePaymentStatus };
