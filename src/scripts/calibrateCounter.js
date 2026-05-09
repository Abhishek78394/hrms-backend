const mongoose = require("mongoose");
const Employee = require("../modules/employees/model/employee.model");
const Counter = require("../modules/employees/model/counter.model");

async function fixCounter() {
  try {
    console.log("Starting counter calibration...");
    
    // Find all employees and extract the numbers
    const employees = await Employee.find({}, { employeeId: 1 });
    let maxId = 12; // Base minimum
    
    employees.forEach(emp => {
      if (emp.employeeId) {
        const parts = emp.employeeId.split("-");
        if (parts.length > 1) {
          const num = parseInt(parts[1]);
          if (!isNaN(num)) {
            maxId = Math.max(maxId, num);
          }
        }
      }
    });
    
    console.log(`True Maximum Employee ID found: EMP-${maxId.toString().padStart(5, "0")}`);
    
    // Update the counter to this max value
    const counter = await Counter.findByIdAndUpdate(
      { _id: "employeeId" },
      { $set: { seq: maxId } },
      { new: true, upsert: true }
    );
    
    console.log(`Counter updated successfully to: ${counter.seq}`);
    console.log("Next assigned ID will be:", `EMP-${(counter.seq + 1).toString().padStart(5, "0")}`);
    
  } catch (error) {
    console.error("Error during calibration:", error);
  }
}

module.exports = fixCounter;
