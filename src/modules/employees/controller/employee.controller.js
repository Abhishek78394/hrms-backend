const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse } = require("../../../common/utils/apiResponse");
const employeeService = require("../service/employee.service");

exports.createEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.validated.body);
  return successResponse(res, "Employee created", employee, {}, 201);
});

exports.getNextId = asyncHandler(async (req, res) => {
  const nextId = await employeeService.getNextId();
  return successResponse(res, "Next ID fetched", { nextId });
});

exports.listEmployees = asyncHandler(async (req, res) => {
  const result = await employeeService.listEmployees(req.validated.query);
  return successResponse(res, "Employees fetched", result.items, result.meta);
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployee(req.params.id);
  return successResponse(res, "Employee fetched", employee || {});
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.validated.body);
  return successResponse(res, "Employee updated", employee || {});
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  return successResponse(res, "Employee deleted");
});
