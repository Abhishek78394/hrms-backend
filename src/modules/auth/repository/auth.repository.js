const crypto = require("crypto");
const Session = require("../model/session.model");

class AuthRepository {
  async createSession({ userId, refreshToken, userAgent, ipAddress, deviceId, expiresAt }) {
    return Session.create({
      userId,
      refreshTokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      userAgent,
      ipAddress,
      deviceId,
      expiresAt
    });
  }

  async findActiveSession(refreshToken) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    return Session.findOne({ refreshTokenHash: tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } });
  }

  async revokeSessionByToken(refreshToken) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    return Session.findOneAndUpdate({ refreshTokenHash: tokenHash }, { isRevoked: true }, { new: true });
  }

  async revokeAllUserSessions(userId) {
    return Session.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  }
}

module.exports = new AuthRepository();
