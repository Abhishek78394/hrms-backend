const BaseRepository = require("../../../common/database/baseRepository");
const Employee = require("../model/employee.model");

class EmployeeRepository extends BaseRepository {
  constructor() {
    super(Employee);
  }
}

module.exports = new EmployeeRepository();
