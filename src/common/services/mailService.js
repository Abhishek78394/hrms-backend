const nodemailer = require("nodemailer");
const env = require("../../config/env");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendMail({ to, subject, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });
      console.log(`[MailService] Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[MailService] Error sending email to ${to}:`, error);
      throw error;
    }
  }

  async sendOtpEmail(to, otp) {
    const subject = `Your Security Code: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; text-align: center;">NexHR Security Check</h2>
        <p style="color: #64748b; font-size: 16px;">Hello,</p>
        <p style="color: #64748b; font-size: 16px;">We received a request to reset your password. Please use the following 6-digit verification code to proceed:</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #0f172a; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2024 NexHR Portal. All rights reserved.</p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }
}

module.exports = new MailService();
