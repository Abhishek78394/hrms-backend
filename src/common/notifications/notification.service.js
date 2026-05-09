class NotificationService {
  async sendEmail({ to, subject, body }) {
    return { queued: true, channel: "email", to, subject, body };
  }

  async sendInApp({ userId, title, message }) {
    return { queued: true, channel: "inApp", userId, title, message };
  }
}

module.exports = new NotificationService();
