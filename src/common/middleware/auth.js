const { StatusCodes } = require("http-status-codes");
const ApiError = require("../exceptions/ApiError");
const { verifyAccessToken } = require("../services/tokenService");

const auth = (req, res, next) => {
  const bearer = req.headers.authorization;
  const token = bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : req.cookies?.accessToken;
  if (!token) return next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
  const payload = verifyAccessToken(token);
  req.user = payload;
  return next();
};

module.exports = auth;
