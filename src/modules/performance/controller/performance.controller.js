const Performance = require("../model/performance.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const addReview = asyncHandler(async (req, res) => {
  const { employeeId, ratings, feedback, period } = req.body;
  
  const values = Object.values(ratings);
  const averageRating = values.reduce((a, b) => a + b, 0) / values.length;

  const review = await Performance.create({
    employeeId,
    reviewerId: req.user._id,
    period,
    ratings,
    averageRating,
    feedback
  });

  return successResponse(res, "Review added successfully", review);
});

const listReviews = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const filter = { deletedAt: null };
  if (employeeId) filter.employeeId = employeeId;

  const reviews = await Performance.find(filter)
    .populate("employeeId", "firstName lastName employeeId")
    .populate("reviewerId", "fullName")
    .sort("-reviewDate");

  return successResponse(res, "Performance reviews", reviews);
});

module.exports = { addReview, listReviews };
