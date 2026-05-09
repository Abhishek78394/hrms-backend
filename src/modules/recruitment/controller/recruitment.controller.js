const Job = require("../model/job.model");
const Candidate = require("../model/candidate.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse } = require("../../../common/utils/apiResponse");

// Job Controllers
exports.createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, createdBy: req.user._id });
  return successResponse(res, "Job posted successfully", job, {}, 201);
});

exports.listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ deletedAt: null }).sort("-createdAt");
  return successResponse(res, "Jobs fetched", jobs);
});

exports.getJobDetails = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  return successResponse(res, "Job details fetched", job);
});

// Candidate Controllers
exports.applyJob = asyncHandler(async (req, res) => {
  const candidate = await Candidate.create(req.body);
  return successResponse(res, "Application submitted successfully", candidate, {}, 201);
});

exports.listCandidates = asyncHandler(async (req, res) => {
  const { jobId, status } = req.query;
  const filter = { deletedAt: null };
  if (jobId) filter.jobId = jobId;
  if (status) filter.status = status;

  const candidates = await Candidate.find(filter)
    .populate("jobId", "title department")
    .sort("-createdAt");
  return successResponse(res, "Candidates fetched", candidates);
});

exports.updateCandidateStatus = asyncHandler(async (req, res) => {
  const { status, overallFeedback } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id, 
    { status, overallFeedback }, 
    { new: true }
  );
  return successResponse(res, "Candidate status updated", candidate);
});

exports.addInterview = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    { $push: { interviews: req.body } },
    { new: true }
  );
  return successResponse(res, "Interview added", candidate);
});

exports.getRecruitmentStats = asyncHandler(async (req, res) => {
  const totalJobs = await Job.countDocuments({ status: "Open", deletedAt: null });
  const totalCandidates = await Candidate.countDocuments({ deletedAt: null });
  const hiredCount = await Candidate.countDocuments({ status: "Hired", deletedAt: null });
  
  const statusStats = await Candidate.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return successResponse(res, "Recruitment stats", { totalJobs, totalCandidates, hiredCount, statusStats });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  await Job.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
  return successResponse(res, "Job deleted successfully");
});

exports.deleteCandidate = asyncHandler(async (req, res) => {
  await Candidate.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
  return successResponse(res, "Candidate deleted successfully");
});
