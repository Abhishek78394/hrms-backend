const express = require("express");
const controller = require("../controller/leave.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.applyLeave);
router.get("/balance", controller.getLeaveBalance);
router.get("/", controller.listLeaves);
router.patch("/:id/action", controller.actionLeave);

module.exports = router;
