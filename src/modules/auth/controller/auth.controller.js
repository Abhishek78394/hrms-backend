const { successResponse } = require("../../../common/utils/apiResponse");
const asyncHandler = require("../../../common/utils/asyncHandler");
const authService = require("../service/auth.service");

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, deviceId } = req.validated.body;
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    deviceId
  });

  res.cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  return successResponse(res, "Login successful", { user, accessToken });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.validated.body.refreshToken;
  const tokens = await authService.refreshToken(token);
  res.cookie("accessToken", tokens.accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
  return successResponse(res, "Token refreshed", tokens);
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.validated.body.refreshToken;
  await authService.logout(token);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return successResponse(res, "Logout successful");
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.validated.body.email);
  return successResponse(res, "OTP has been sent to your registered email", data);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.validated.body;
  await authService.resetPassword(email, otp, password);
  return successResponse(res, "Password has been reset successfully");
});
