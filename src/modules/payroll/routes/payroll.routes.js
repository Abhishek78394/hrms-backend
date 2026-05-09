const express = require("express");
const controller = require("../controller/payroll.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.generatePayroll);
router.get("/", controller.listPayrolls);
router.patch("/:id/status", controller.updatePaymentStatus);

module.exports = router;
