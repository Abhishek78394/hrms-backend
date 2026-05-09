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
    .populate("employeeId", "firstName lastName employeeId")
    .sort("-createdAt");

  return successResponse(res, "Employee documents", docs);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Document.findByIdAndUpdate(id, { deletedAt: new Date() });
  return successResponse(res, "Document deleted successfully");
});

module.exports = { uploadDocument, listDocuments, deleteDocument };
