/**
 * Email Service
 * Handles sending transactional emails including subscription confirmations and invoices
 */

// In-memory email log for testing
const sentEmails: any[] = [];

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content?: string;
    path?: string;
  }[];
}

class EmailService {
  private fromEmail: string = 'Atlas Sanctum <hello@atlassanctum.com>';
  private companyAddress: string = 'San Francisco, CA, United States';

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In production, use a real email service like SendGrid, AWS SES, etc.
      // For now, log the email and return success
      
      const emailRecord = {
        id: `email_${Date.now()}`,
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map(a => ({ ...a, content: '[REDACTED]' })),
        sentAt: new Date().toISOString(),
      };

      sentEmails.push(emailRecord);

      console.log(`[Email Service] Email sent to ${options.to}: ${options.subject}`);

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true, messageId: emailRecord.id };
    } catch (error: any) {
      console.error('[Email Service] Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    userName: string,
    planName: string,
    billingPeriod: string,
    amount: number,
    discountAmount?: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const totalAmount = discountAmount ? amount - discountAmount : amount;
    const discountSection = discountAmount 
      ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Discount Applied</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #10b981;">-$${discountAmount.toFixed(2)}</td>
        </tr>
      `
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">🌿 Atlas Sanctum</h1>
          <p style="color: #666; margin-top: 5px;">Regenerating Earth's Future</p>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
          <h2 style="margin: 0; font-size: 24px;">Subscription Confirmed!</h2>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for joining the regenerative revolution</p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #333;">Welcome, ${userName}!</h3>
          <p style="color: #666;">Your subscription to Atlas Sanctum has been confirmed. Here's a summary of your purchase:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Plan</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Billing Period</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${billingPeriod === 'monthly' ? 'Monthly' : 'Annual'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Subtotal</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${amount.toFixed(2)}</td>
            </tr>
            ${discountSection}
            <tr style="background: #e0f2fe;">
              <td style="padding: 15px; font-weight: bold; font-size: 16px;">Total Paid</td>
              <td style="padding: 15px; font-weight: bold; font-size: 16px; text-align: right; color: #10b981;">$${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <p style="color: #666; font-size: 14px;">
            A detailed invoice has been sent to your email and is available in your dashboard.
          </p>
        </div>

        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
          <h4 style="margin: 0 0 10px 0; color: #059669;">What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #065f46;">
            <li>Explore your new subscription features</li>
            <li>Set up your profile and preferences</li>
            <li>Start tracking your environmental impact</li>
            <li>Connect with our community of regenerators</li>
          </ul>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:hello@atlassanctum.com" style="color: #10b981;">hello@atlassanctum.com</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Atlas Sanctum - Regenerating Earth's Future<br>
            ${this.companyAddress}
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to Atlas Sanctum - ${planName} Subscription Confirmed`,
      html,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(
    email: string,
    invoiceNumber: string,
    invoiceHtml: string,
    invoicePdfFilename: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">🌿 Atlas Sanctum</h1>
          <p style="color: #666; margin-top: 5px;">Regenerating Earth's Future</p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h2 style="margin-top: 0; color: #333;">Invoice ${invoiceNumber}</h2>
          <p style="color: #666;">Please find your invoice attached to this email.</p>
          
          <p style="color: #666;">
            You can also view and download your invoice anytime from your 
            <a href="https://atlassanctum.com/billing" style="color: #10b981;">billing dashboard</a>.
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:hello@atlassanctum.com" style="color: #10b981;">hello@atlassanctum.com</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Atlas Sanctum - Regenerating Earth's Future<br>
            ${this.companyAddress}
          </p>
        </div>
      </body>
      </html>
    `;

    // In production, attach the PDF file
    // For now, just send the email without attachment
    return this.sendEmail({
      to: email,
      subject: `Invoice ${invoiceNumber} from Atlas Sanctum`,
      html,
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(
    email: string,
    userName: string,
    amount: number,
    failureReason: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Issue</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">🌿 Atlas Sanctum</h1>
        </div>

        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">Payment Issue</h3>
          <p style="margin: 0; color: #7f1d1d;">
            We were unable to process your payment of $${amount.toFixed(2)}.
          </p>
          <p style="margin: 10px 0 0 0; color: #7f1d1d;">
            <strong>Reason:</strong> ${failureReason}
          </p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h4 style="margin-top: 0;">What to do next:</h4>
          <ul style="color: #666;">
            <li>Check that your payment method has sufficient funds</li>
            <li>Verify your card information is correct</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
          <p style="color: #666;">
            Please update your payment information to avoid service interruption.
          </p>
          <a href="https://atlassanctum.com/billing" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 15px;">
            Update Payment Method
          </a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:hello@atlassanctum.com" style="color: #10b981;">hello@atlassanctum.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Issue - Atlas Sanctum Subscription`,
      html,
    });
  }

  /**
   * Send subscription renewal reminder
   */
  async sendRenewalReminder(
    email: string,
    userName: string,
    planName: string,
    renewalDate: Date,
    amount: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Renewal Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">🌿 Atlas Sanctum</h1>
        </div>

        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">Subscription Renewal Reminder</h3>
          <p style="margin: 0; color: #065f46;">
            Hi ${userName}, your ${planName} subscription will renew in ${daysUntilRenewal} days.
          </p>
        </div>

        <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h4 style="margin-top: 0;">Renewal Details:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Plan</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Renewal Date</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${renewalDate.toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Amount</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">$${amount.toFixed(2)}</td>
            </tr>
          </table>

          <p style="color: #666; margin-top: 20px;">
            Your payment method will be charged automatically on the renewal date.
          </p>
          
          <a href="https://atlassanctum.com/billing" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 15px;">
            Manage Subscription
          </a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at <a href="mailto:hello@atlassanctum.com" style="color: #10b981;">hello@atlassanctum.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Subscription Renewal Reminder - ${planName}`,
      html,
    });
  }

  /**
   * Get sent emails (for testing)
   */
  getSentEmails() {
    return sentEmails;
  }

  /**
   * Clear sent emails (for testing)
   */
  clearSentEmails() {
    sentEmails.length = 0;
  }
}

export const emailService = new EmailService();
