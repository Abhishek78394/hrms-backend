const express = require("express");
const controller = require("../controller/recruitment.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();

// Public routes (for job applications)
router.get("/jobs", controller.listJobs);
router.get("/jobs/:id", controller.getJobDetails);
router.post("/apply", controller.applyJob);

// Protected routes (for Admin/HR)
router.use(auth);
router.post("/jobs", controller.createJob);
router.get("/candidates", controller.listCandidates);
router.patch("/candidates/:id/status", controller.updateCandidateStatus);
router.post("/candidates/:id/interviews", controller.addInterview);
router.delete("/jobs/:id", controller.deleteJob);
router.delete("/candidates/:id", controller.deleteCandidate);
router.get("/stats", controller.getRecruitmentStats);

module.exports = router;
