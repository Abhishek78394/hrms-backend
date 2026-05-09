const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../../../common/exceptions/ApiError");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../../common/services/tokenService");
const env = require("../../../config/env");
const User = require("../../users/model/user.model");
const authRepository = require("../repository/auth.repository");

class AuthService {
  async login({ email, password, userAgent, ipAddress, deviceId }) {
    const user = await User.findOne({ email, deletedAt: null }).select("+password +failedLoginAttempts +lockUntil");
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Account is temporarily locked");
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + env.LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const payload = { sub: user._id.toString(), role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshMs = this.parseExpiresToMs(env.JWT_REFRESH_EXPIRES_IN);
    await authRepository.createSession({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      deviceId,
      expiresAt: new Date(Date.now() + refreshMs)
    });

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const session = await authRepository.findActiveSession(refreshToken);
    if (!session) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid session");

    await authRepository.revokeSessionByToken(refreshToken);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role, email: payload.email });
    const newRefreshToken = signRefreshToken({ sub: payload.sub, role: payload.role, email: payload.email });

    await authRepository.createSession({
      userId: payload.sub,
      refreshToken: newRefreshToken,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      deviceId: session.deviceId,
      expiresAt: new Date(Date.now() + this.parseExpiresToMs(env.JWT_REFRESH_EXPIRES_IN))
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;
    await authRepository.revokeSessionByToken(refreshToken);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "No account associated with this email address");
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp; 
    user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    const mailService = require("../../../common/services/mailService");
    await mailService.sendOtpEmail(email, otp);
    
    return { email };
  }

  async resetPassword(email, otp, password) {
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpiresAt: { $gt: new Date() },
      deletedAt: null
    }).select("+password");

    if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP code");

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    user.passwordChangedAt = new Date();
    await user.save();
    await authRepository.revokeAllUserSessions(user._id);
  }

  parseExpiresToMs(value) {
    if (value.endsWith("d")) return Number(value.replace("d", "")) * 24 * 60 * 60 * 1000;
    if (value.endsWith("h")) return Number(value.replace("h", "")) * 60 * 60 * 1000;
    if (value.endsWith("m")) return Number(value.replace("m", "")) * 60 * 1000;
    return Number(value) * 1000;
  }
}

module.exports = new AuthService();
