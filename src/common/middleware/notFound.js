const { errorResponse } = require("../utils/apiResponse");

const notFound = (req, res) => errorResponse(res, "Route not found", [{ path: req.originalUrl }], 404);

module.exports = notFound;
