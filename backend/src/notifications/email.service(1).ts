import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || this.configService.get<number>('MAIL_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('MAIL_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS') || this.configService.get<string>('MAIL_PASS') || this.configService.get<string>('MAIL_PASSWORD');
    const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Email Transporter initialized for ${host} (${user})`);
    } else {
      this.logger.warn('SMTP credentials not configured. OTP Emails will dispatch to server logs and SMTP queue.');
    }
  }

  async sendOtpEmail(toEmail: string, otpCode: string, name?: string) {
    const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('MAIL_FROM') || '"DriveElite Support" <annaskhalid794@gmail.com>';
    const subject = `${otpCode} is your DriveElite Account Verification Code`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 800;">DriveElite Car Rentals</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Identity Verification</p>
        </div>
        <p style="color: #334155; font-size: 14px;">Hello <strong>${name || 'Valued Customer'}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Thank you for registering with DriveElite. Please use the following 6-digit Security OTP code to verify your registered email address:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a; background-color: #f8fafc; padding: 14px 28px; border-radius: 12px; border: 2px border-sky-200; display: inline-block;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">This security OTP code is valid for <strong>10 minutes</strong>. Never share your OTP code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">&copy; 2026 DriveElite Car Rental System. All rights reserved.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          html,
        });
        this.logger.log(`OTP Email successfully delivered to ${toEmail}`);
        return true;
      } catch (err) {
        this.logger.error(`Failed to deliver OTP Email to ${toEmail}: ${err.message}`);
        return false;
      }
    } else {
      this.logger.log(`[SMTP SIMULATION to ${toEmail}] Subject: "${subject}" | Security Code: ${otpCode}`);
      return true;
    }
  }
}
