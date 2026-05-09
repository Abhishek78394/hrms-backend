const employeeRepository = require("../repository/employee.repository");
const mongoose = require("mongoose");
const User = require("../../users/model/user.model");
const Counter = require("../model/counter.model");
const mailService = require("../../../common/services/mailService");

class EmployeeService {
  /**
   * Create Employee
   * Removed transactions to support standalone MongoDB instances (local development)
   */
  async createEmployee(payload) {
    // 1. Create User record first for authentication
    let userId = null;
    if (payload.password) {
      try {
        const user = await User.create({
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: payload.password,
          role: payload.role || "Employee",
          phone: payload.phone,
          status: "active"
        });
        userId = user._id;
      } catch (userError) {
        console.error("Failed to create user record:", userError);
        throw userError;
      }
    }

    // 2. Create Employee record with the linked userId
    const employee = await employeeRepository.create({ ...payload, userId });
    
    // 3. Send welcome invite email if password was provided (new user created)
    if (payload.password && payload.email) {
      try {
        await mailService.sendInviteEmail(payload.email, payload.password, payload.firstName);
      } catch (emailErr) {
        console.error("Failed to send invite email:", emailErr);
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
    const { search, department, designation, status, role, sort, page, limit } = query;
    const filter = {};
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (status) filter.status = status;
    if (role) {
      if (role.startsWith("!")) {
        filter.role = { $ne: role.substring(1) };
      } else {
        filter.role = role;
      }
    }
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex }
      ];
    }
    return employeeRepository.findAll(filter, { sort, page, limit, projection: "-profileImage" });
  }

  getEmployee(id) {
    return employeeRepository.model.findById(id).lean();
  }

  getEmployeeByUserId(userId) {
    return employeeRepository.model.findOne({ userId, deletedAt: null }).lean();
  }

  async updateEmployee(id, payload) {
    // 1. Update Employee
    const employee = await employeeRepository.updateById(id, payload);
    
    // 2. Sync with User record
    if (payload.email || payload.role || payload.firstName || payload.lastName) {
      try {
        await User.findByIdAndUpdate(
          employee.userId,
          { 
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role,
            email: employee.email
          },
          { new: true }
        );
      } catch (userErr) {
        console.error("Service: User sync error:", userErr);
      }
    }
    return employee;
  }

  deleteEmployee(id) {
    return employeeRepository.softDeleteById(id);
  }
}

module.exports = new EmployeeService();
