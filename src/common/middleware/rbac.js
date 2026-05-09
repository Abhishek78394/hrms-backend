const { StatusCodes } = require("http-status-codes");
const ApiError = require("../exceptions/ApiError");

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Permission denied"));
  }
  return next();
};

module.exports = allowRoles;
