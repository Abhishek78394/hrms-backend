const PerformanceReview = require("../model/performanceReview.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

exports.createReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.create({
    ...req.body,
    reviewerId: req.user._id
  });
  return successResponse(res, "Performance review submitted successfully", review, {}, 201);
});

exports.listReviews = asyncHandler(async (req, res) => {
  const { employeeId, period } = req.query;
  const filter = { deletedAt: null };

  if (req.user.role === "Employee") {
    const emp = await Employee.findOne({ userId: req.user._id });
    if (!emp) return successResponse(res, "No reviews found", []);
    filter.employeeId = emp._id;
  } else {
    if (employeeId) filter.employeeId = employeeId;
  }

  if (period) filter.period = period;

  const reviews = await PerformanceReview.find(filter)
    .populate("employeeId", "firstName lastName employeeId designation department")
    .populate("reviewerId", "firstName lastName")
    .sort("-period -createdAt");

  return successResponse(res, "Performance reviews fetched", reviews);
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const stats = await PerformanceReview.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: "$reviewType",
        avgRating: { $avg: "$averageRating" },
        count: { $sum: 1 }
      }
    }
  ]);

  const topPerformers = await PerformanceReview.find({ deletedAt: null })
    .sort("-averageRating")
    .limit(5)
    .populate("employeeId", "firstName lastName profileImage");

  return successResponse(res, "Performance analytics", { stats, topPerformers });
});

exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const review = await PerformanceReview.findByIdAndUpdate(id, { status }, { new: true });
  return successResponse(res, "Review status updated", review);
});
