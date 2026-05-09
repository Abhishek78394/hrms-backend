const express = require("express");
const validate = require("../../../common/middleware/validate");
const auth = require("../../../common/middleware/auth");
const allowRoles = require("../../../common/middleware/rbac");
const { ADMIN, HR, EMPLOYEE } = require("../../../common/constants/roles");
const employeeController = require("../controller/employee.controller");
const employeeValidation = require("../validation/employee.validation");

const router = express.Router();
router.use(auth);

router.get("/me", allowRoles(ADMIN, HR, EMPLOYEE), employeeController.getMyProfile);
router.patch("/me", allowRoles(ADMIN, HR, EMPLOYEE), validate(employeeValidation.updateMyProfile), employeeController.updateMyProfile);
router.get("/next-id", allowRoles(ADMIN, HR), employeeController.getNextId);
router.get("/", allowRoles(ADMIN, HR, EMPLOYEE), validate(employeeValidation.listEmployees), employeeController.listEmployees);
router.get("/:id", allowRoles(ADMIN, HR, EMPLOYEE), validate(employeeValidation.idParam), employeeController.getEmployee);
router.patch("/:id", allowRoles(ADMIN, HR), validate(employeeValidation.updateEmployee), employeeController.updateEmployee);
router.delete("/:id", allowRoles(ADMIN, HR), validate(employeeValidation.idParam), employeeController.deleteEmployee);

module.exports = router;
