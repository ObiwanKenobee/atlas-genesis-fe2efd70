import sgMail from '@sendgrid/mail';
import { query } from '../db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailPreferences {
  marketing: boolean;
  transactional: boolean;
  notifications: boolean;
}

class EmailService {
  private sendgridConfigured: boolean;

  constructor() {
    this.sendgridConfigured = !!process.env.SENDGRID_API_KEY;
    if (this.sendgridConfigured) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    } else if (process.env.NODE_ENV === 'production') {
      throw new Error('SENDGRID_API_KEY environment variable is required in production');
    } else {
      console.warn('SENDGRID_API_KEY not configured - emails will be logged but not sent');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@atlasgenesis.com',
          name: process.env.FROM_NAME || 'Atlas Genesis'
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await sgMail.send(msg);
    } catch (error: any) {
      console.error('Email sending failed:', error);
      // Don't throw error for email failures to avoid breaking user flows
      // Log the error for monitoring
    }
  }

  // Rate limiting: track emails sent per user per hour
  private emailRateLimit = new Map<string, { count: number; resetTime: number }>();

  private checkRateLimit(email: string): boolean {
    const now = Date.now();
    const userLimit = this.emailRateLimit.get(email);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize limit
      this.emailRateLimit.set(email, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hour
      return true;
    }

    if (userLimit.count >= 10) { // Max 10 emails per hour
      return false;
    }

    userLimit.count++;
    return true;
  }

  async sendEmailWithRateLimit(options: EmailOptions): Promise<void> {
    if (!this.checkRateLimit(options.to)) {
      console.warn(`Rate limit exceeded for email: ${options.to}`);
      return;
    }
    await this.sendEmail(options);
  }

  // Check if user has opted in for specific email types
  private async checkEmailPreferences(email: string, type: 'marketing' | 'notifications'): Promise<boolean> {
    try {
      const result = await query('SELECT preferences FROM users WHERE email = $1', [email.toLowerCase()]);
      if (result.rowCount === 0) {
        return true; // Default to true for new users
      }

      const preferences = result.rows[0].preferences || {};
      const emailPrefs = preferences.email || {
        marketing: true,
        transactional: true,
        notifications: true
      };

      return emailPrefs[type];
    } catch (error) {
      console.error('Error checking email preferences:', error);
      return true; // Default to true on error
    }
  }

  async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
    const subject = 'Welcome to Atlas Genesis!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Atlas Genesis, ${displayName}!</h1>
        <p>Thank you for joining our comprehensive platform for humanitarian and environmental impact tracking.</p>
        <p>Your account has been created successfully. You can now start exploring projects, tracking measurements, and contributing to global sustainability efforts.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ul>
            <li>Complete your profile</li>
            <li>Explore available projects</li>
            <li>Set up your notification preferences</li>
            <li>Start contributing to impact measurements</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendEmailVerification(email: string, displayName: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email - Atlas Genesis';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email Address</h1>
        <p>Hello ${displayName},</p>
        <p>Thank you for signing up for Atlas Genesis. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account with Atlas Genesis, please ignore this email.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendPasswordResetEmail(email: string, displayName: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - Atlas Genesis';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>Hello ${displayName},</p>
        <p>You have requested to reset your password for your Atlas Genesis account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendLoginNotification(email: string, displayName: string, deviceInfo: any): Promise<void> {
    const subject = 'New Login to Your Atlas Genesis Account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Login Detected</h1>
        <p>Hello ${displayName},</p>
        <p>We detected a new login to your Atlas Genesis account. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Device:</strong> ${deviceInfo?.userAgent || 'Unknown'}</p>
          <p><strong>IP Address:</strong> ${deviceInfo?.ip || 'Unknown'}</p>
        </div>
        <p>If this was you, no action is needed. If you don't recognize this activity, please change your password immediately and contact our support team.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  // New email methods for comprehensive notification system

  async sendPaymentConfirmation(email: string, displayName: string, paymentDetails: any): Promise<void> {
    const subject = 'Payment Confirmation - Atlas Genesis';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Payment Confirmation</h1>
        <p>Hello ${displayName},</p>
        <p>Your payment has been successfully processed. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
          <p><strong>Reference:</strong> ${paymentDetails.reference}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Description:</strong> ${paymentDetails.description || 'Project Investment'}</p>
        </div>
        <p>Thank you for your contribution to sustainable development!</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendMarketplacePurchaseNotification(email: string, displayName: string, purchaseDetails: any): Promise<void> {
    // Purchase confirmations are transactional and should always be sent
    const subject = 'Purchase Confirmation - Atlas Genesis Marketplace';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Purchase Confirmation</h1>
        <p>Hello ${displayName},</p>
        <p>Your purchase has been completed successfully. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Item:</strong> ${purchaseDetails.itemName}</p>
          <p><strong>Quantity:</strong> ${purchaseDetails.quantity}</p>
          <p><strong>Total Amount:</strong> $${purchaseDetails.totalAmount}</p>
          <p><strong>Transaction ID:</strong> ${purchaseDetails.transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>You can track your investment impact in your dashboard.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendMarketplaceSaleNotification(email: string, displayName: string, saleDetails: any): Promise<void> {
    // Check if user wants notifications
    const canSend = await this.checkEmailPreferences(email, 'notifications');
    if (!canSend) return;

    const subject = 'New Sale - Atlas Genesis Marketplace';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Sale Notification</h1>
        <p>Hello ${displayName},</p>
        <p>Great news! Your listing has been sold. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Item:</strong> ${saleDetails.itemName}</p>
          <p><strong>Quantity Sold:</strong> ${saleDetails.quantity}</p>
          <p><strong>Sale Amount:</strong> $${saleDetails.amount}</p>
          <p><strong>Buyer:</strong> ${saleDetails.buyerName}</p>
          <p><strong>Transaction ID:</strong> ${saleDetails.transactionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>The funds will be available in your account shortly.</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendGovernanceProposalNotification(email: string, displayName: string, proposalDetails: any): Promise<void> {
    // Check if user wants notifications
    const canSend = await this.checkEmailPreferences(email, 'notifications');
    if (!canSend) return;

    const subject = `New Governance Proposal - ${proposalDetails.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Governance Proposal</h1>
        <p>Hello ${displayName},</p>
        <p>A new governance proposal has been submitted for your review:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${proposalDetails.title}</h3>
          <p>${proposalDetails.description}</p>
          <p><strong>Proposed by:</strong> ${proposalDetails.proposer}</p>
          <p><strong>Voting Period:</strong> ${new Date(proposalDetails.startDate).toLocaleDateString()} - ${new Date(proposalDetails.endDate).toLocaleDateString()}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/governance/proposals/${proposalDetails.id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Proposal & Vote</a>
        </div>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendGovernanceVoteConfirmation(email: string, displayName: string, voteDetails: any): Promise<void> {
    // Vote confirmations are transactional and should always be sent
    const subject = 'Vote Recorded - Atlas Genesis Governance';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Vote Recorded</h1>
        <p>Hello ${displayName},</p>
        <p>Your vote has been successfully recorded. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Proposal:</strong> ${voteDetails.proposalTitle}</p>
          <p><strong>Your Vote:</strong> ${voteDetails.choice}</p>
          <p><strong>Voting Weight:</strong> ${voteDetails.weight}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Thank you for participating in platform governance!</p>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }

  async sendMeasurementUpdateNotification(email: string, displayName: string, measurementDetails: any): Promise<void> {
    // Check if user wants notifications
    const canSend = await this.checkEmailPreferences(email, 'notifications');
    if (!canSend) return;

    const subject = 'Measurement Update - Atlas Genesis';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Measurement Update</h1>
        <p>Hello ${displayName},</p>
        <p>New measurement data has been recorded for a project you're following:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Project:</strong> ${measurementDetails.projectName}</p>
          <p><strong>Measurement Type:</strong> ${measurementDetails.type}</p>
          <p><strong>Value:</strong> ${measurementDetails.value}</p>
          <p><strong>Date:</strong> ${new Date(measurementDetails.timestamp).toLocaleString()}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/projects/${measurementDetails.projectId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Project</a>
        </div>
        <p>Best regards,<br>The Atlas Genesis Team</p>
      </div>
    `;

    await this.sendEmailWithRateLimit({ to: email, subject, html });
  }
}

export const emailService = new EmailService();