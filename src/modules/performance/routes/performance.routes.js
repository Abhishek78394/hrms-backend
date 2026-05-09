const express = require("express");
const controller = require("../controller/performance.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.addReview);
router.get("/", controller.listReviews);

module.exports = router;
