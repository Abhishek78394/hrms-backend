const express = require("express");
const controller = require("../controller/attendance.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/check-in", controller.checkIn);
router.post("/check-out", controller.checkOut);
router.get("/", controller.listAttendance);

module.exports = router;
