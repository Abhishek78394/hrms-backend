const employeeRepository = require("../repository/employee.repository");
const mongoose = require("mongoose");
const User = require("../../users/model/user.model");
const Counter = require("../model/counter.model");

class EmployeeService {
  /**
   * Create Employee
   * Removed transactions to support standalone MongoDB instances (local development)
   */
  async createEmployee(payload) {
    // 1. Create Employee record
    const employee = await employeeRepository.create(payload);

    // 2. Create corresponding User record for authentication
    if (payload.password) {
      try {
        await User.create({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          role: payload.role || "Employee",
          phone: payload.phone,
          status: "active"
        });
      } catch (userError) {
        console.error("Failed to create user record, but employee was created:", userError);
        // Note: In standalone mode, we can't rollback automatically without transactions
        // but we notify the log.
      }
    }

    return employee;
  }

  async getNextId() {
    const Employee = mongoose.model("Employee");
    const allEmployees = await Employee.find({}, { employeeId: 1 });
    let maxFound = 12;
    
    allEmployees.forEach(emp => {
      if (emp.employeeId) {
        const parts = emp.employeeId.split("-");
        if (parts.length > 1) {
          const num = parseInt(parts[1]);
          if (!isNaN(num)) maxFound = Math.max(maxFound, num);
        }
      }
    });

    const nextNum = maxFound + 1;
    return `EMP-${nextNum.toString().padStart(5, "0")}`;
  }

  listEmployees(query) {
    const { search, department, designation, status, sort, page, limit } = query;
    const filter = {};
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };
    return employeeRepository.findAll(filter, { sort, page, limit });
  }

  getEmployee(id) {
    return employeeRepository.findById(id);
  }

  async updateEmployee(id, payload) {
    // 1. Update Employee
    const employee = await employeeRepository.updateById(id, payload);
    
    // 2. Sync with User record
    if (payload.email || payload.role || payload.firstName || payload.lastName) {
      try {
        await User.findOneAndUpdate(
          { email: employee.email },
          { 
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role,
            email: employee.email
          }
        );
      } catch (userError) {
        console.error("Failed to sync user record during employee update:", userError);
      }
    }

    return employee;
  }

  deleteEmployee(id) {
    return employeeRepository.softDeleteById(id);
  }
}

module.exports = new EmployeeService();
