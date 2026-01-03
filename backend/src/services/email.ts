import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
    const subject = 'Welcome to Atlas Sanctum!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Atlas Sanctum, ${displayName}!</h1>
        <p>Thank you for joining our regenerative investment platform.</p>
        <p>Your account has been created successfully. You can now start exploring investment opportunities in regenerative agriculture and sustainable development projects.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ul>
            <li>Complete your profile</li>
            <li>Explore available projects</li>
            <li>Set up your investment preferences</li>
            <li>Start your first investment</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Atlas Sanctum Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendEmailVerification(email: string, displayName: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email - Atlas Sanctum';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email Address</h1>
        <p>Hello ${displayName},</p>
        <p>Thank you for signing up for Atlas Sanctum. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account with Atlas Sanctum, please ignore this email.</p>
        <p>Best regards,<br>The Atlas Sanctum Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email: string, displayName: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - Atlas Sanctum';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>Hello ${displayName},</p>
        <p>You have requested to reset your password for your Atlas Sanctum account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br>The Atlas Sanctum Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendLoginNotification(email: string, displayName: string, deviceInfo: any): Promise<void> {
    const subject = 'New Login to Your Atlas Sanctum Account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Login Detected</h1>
        <p>Hello ${displayName},</p>
        <p>We detected a new login to your Atlas Sanctum account. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Device:</strong> ${deviceInfo?.userAgent || 'Unknown'}</p>
          <p><strong>IP Address:</strong> ${deviceInfo?.ip || 'Unknown'}</p>
        </div>
        <p>If this was you, no action is needed. If you don't recognize this activity, please change your password immediately and contact our support team.</p>
        <p>Best regards,<br>The Atlas Sanctum Team</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService();