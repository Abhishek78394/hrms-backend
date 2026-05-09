const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../exceptions/ApiError");
const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.isJoi) {
    return errorResponse(
      res,
      "Validation failed",
      err.details.map((d) => ({ field: d.path.join("."), message: d.message })),
      StatusCodes.BAD_REQUEST
    );
  }

  if (err instanceof TokenExpiredError) {
    return errorResponse(res, "Token expired", [{ code: "TOKEN_EXPIRED" }], StatusCodes.UNAUTHORIZED);
  }

  if (err instanceof JsonWebTokenError) {
    return errorResponse(res, "Invalid token", [{ code: "TOKEN_INVALID" }], StatusCodes.UNAUTHORIZED);
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return errorResponse(res, "Duplicate key error", [err.keyValue], StatusCodes.CONFLICT);
  }

  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.errors, err.statusCode);
  }

  return errorResponse(res, "Internal server error", [{ detail: err.message }], StatusCodes.INTERNAL_SERVER_ERROR);
};

module.exports = errorHandler;
