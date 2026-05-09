const Recruitment = require("../model/recruitment.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const createJob = asyncHandler(async (req, res) => {
  const job = await Recruitment.create(req.body);
  return successResponse(res, "Job posted successfully", job);
});

const listJobs = asyncHandler(async (req, res) => {
  const jobs = await Recruitment.find({ deletedAt: null }).sort("-createdAt");
  return successResponse(res, "Job listings", jobs);
});

const applyJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const job = await Recruitment.findById(id);
  if (!job) return errorResponse(res, "Job not found", 404);

  job.applicants.push(req.body);
  await job.save();

  return successResponse(res, "Applied successfully", job);
});

module.exports = { createJob, listJobs, applyJob };
