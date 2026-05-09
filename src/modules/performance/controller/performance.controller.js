const PerformanceReview = require("../model/performanceReview.model");
const Employee = require("../../employees/model/employee.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");
const mailService = require("../../../common/services/mailService");

exports.createReview = asyncHandler(async (req, res) => {
  const review = await PerformanceReview.create({
    ...req.body,
    reviewerId: req.user._id
  });

  // Fetch employee details to send email
  const emp = await Employee.findById(review.employeeId);
  if (emp && emp.email) {
    try {
      await mailService.sendPerformanceReviewEmail(
        emp.email,
        emp.firstName,
        review.period,
        review.averageRating
      );
    } catch (err) {
      console.error("Failed to send performance email:", err);
    }
  }

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
  console.log("Fetching performance analytics...");
  
  try {
    const statsPromise = PerformanceReview.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$reviewType",
          avgRating: { $avg: "$averageRating" },
          count: { $sum: 1 }
        }
      }
    ]);

    const deptStatsPromise = PerformanceReview.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$employeeId",
          totalRating: { $sum: "$averageRating" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: "$employee.department",
          avgRating: { $avg: { $divide: ["$totalRating", "$count"] } }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    const topPerformersPromise = PerformanceReview.find({ deletedAt: null })
      .sort("-averageRating")
      .limit(5)
      .populate("employeeId", "firstName lastName profileImage");

    const [stats, deptStats, topPerformers] = await Promise.all([
      statsPromise,
      deptStatsPromise,
      topPerformersPromise
    ]);

    console.log("Analytics fetched successfully");
    return successResponse(res, "Performance analytics", { stats, topPerformers, deptStats });
  } catch (err) {
    console.error("Analytics Error:", err);
    return errorResponse(res, "Failed to fetch analytics", 500);
  }
});

exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, employeeSelfFeedback } = req.body;
  
  const update = { status };
  if (employeeSelfFeedback) update.employeeSelfFeedback = employeeSelfFeedback;

  const review = await PerformanceReview.findByIdAndUpdate(id, update, { new: true });
  return successResponse(res, "Review updated", review);
});
