const express = require("express");
const controller = require("../controller/recruitment.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.createJob);
router.get("/", controller.listJobs);
router.post("/:id/apply", controller.applyJob);

module.exports = router;
