const express = require("express");
const controller = require("../controller/performance.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.createReview);
router.get("/analytics", controller.getAnalytics);
router.get("/", controller.listReviews);
router.patch("/:id/status", controller.updateReviewStatus);

module.exports = router;
