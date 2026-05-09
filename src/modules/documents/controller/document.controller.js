const Document = require("../model/document.model");
const asyncHandler = require("../../../common/utils/asyncHandler");
const { successResponse, errorResponse } = require("../../../common/utils/apiResponse");

const uploadDocument = asyncHandler(async (req, res) => {
  const { employeeId, title, type, fileUrl } = req.body;
  const doc = await Document.create({
    employeeId,
    title,
    type,
    fileUrl,
    uploadedBy: req.user._id
  });
  return successResponse(res, "Document uploaded successfully", doc);
});

const listDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const filter = { deletedAt: null };
  if (employeeId) filter.employeeId = employeeId;

  const docs = await Document.find(filter)
    .select("-fileUrl") // Exclude heavy base64 data from list
    .populate("employeeId", "firstName lastName employeeId")
    .sort("-createdAt");

  return successResponse(res, "Employee documents", docs);
});

const getDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, deletedAt: null })
    .populate("employeeId", "firstName lastName employeeId")
    .lean();
  if (!doc) return errorResponse(res, "Document not found", 404);
  return successResponse(res, "Document fetched", doc);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Document.findByIdAndUpdate(id, { deletedAt: new Date() });
  return successResponse(res, "Document deleted successfully");
});

module.exports = { uploadDocument, listDocuments, getDocument, deleteDocument };
