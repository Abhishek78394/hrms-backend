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
  async sendInviteEmail(to, password, name) {
    const subject = `Welcome to NexHR - Your Account Details`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; text-align: center;">Welcome to NexHR!</h2>
        <p style="color: #64748b; font-size: 16px;">Hello ${name || ''},</p>
        <p style="color: #64748b; font-size: 16px;">Your account has been successfully created. You can now log in to the enterprise portal using the following credentials:</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Email: <strong>${to}</strong></p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Temporary Password: <strong style="color: #0f172a;">${password}</strong></p>
        </div>
        <p style="color: #64748b; font-size: 14px;">Please make sure to log in and change your password as soon as possible for security reasons.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2024 NexHR Portal. All rights reserved.</p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }

  async sendPerformanceReviewEmail(to, name, period, averageRating) {
    const subject = `Performance Review Published - ${period}`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background-color: #f97316; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 30px; line-height: 60px;">🏆</div>
        </div>
        <h2 style="color: #0f172a; text-align: center; font-weight: 900; font-size: 24px; margin-bottom: 8px;">Performance Review Live</h2>
        <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 32px;">Great work this month! Your evaluation for ${period} is ready.</p>
        
        <div style="background: #f8fafc; padding: 32px; text-align: center; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
          <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Overall Score</p>
          <span style="font-size: 48px; font-weight: 900; color: #f97316;">${averageRating.toFixed(1)}<span style="font-size: 20px; color: #cbd5e1;">/5.0</span></span>
        </div>

        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Hi <strong>${name}</strong>,<br><br>
          Your manager has completed your performance evaluation for <strong>${period}</strong>. You can now log in to the NexHR portal to view your detailed breakdown, strengths, and goals for the next month.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${env.FRONTEND_URL}/performance" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View My Growth Journey</a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; font-weight: 500; text-align: center;">Please log in to acknowledge this review and add your self-feedback.</p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
        <p style="text-align: center; color: #cbd5e1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 NexHR Enterprise Portal</p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }
}

module.exports = new MailService();
