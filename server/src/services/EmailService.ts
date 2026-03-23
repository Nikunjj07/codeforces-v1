import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"CodeArena" <${env.SMTP_USER}>`,
      to,
      subject: 'Reset Your CodeArena Password',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; background:#0A0E1A; color:#F9FAFB; padding:40px; border-radius:12px; max-width:480px; margin:0 auto;">
          <h2 style="color:#06B6D4;">Password Reset</h2>
          <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block; background:#06B6D4; color:#0A0E1A; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#6B7280; font-size:13px;">If you did not request this, ignore this email.</p>
        </div>
      `,
    });
  }

  async sendWelcome(to: string, username: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"CodeArena" <${env.SMTP_USER}>`,
      to,
      subject: 'Welcome to CodeArena 🚀',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; background:#0A0E1A; color:#F9FAFB; padding:40px; border-radius:12px; max-width:480px; margin:0 auto;">
          <h2 style="color:#06B6D4;">Welcome, ${username}!</h2>
          <p>You've joined CodeArena. Start competing with the best coders around the world.</p>
          <a href="${env.CLIENT_URL}/contests"
             style="display:inline-block; background:#06B6D4; color:#0A0E1A; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; margin:16px 0;">
            Browse Contests
          </a>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
