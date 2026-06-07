/**
 * Payment Service
 * 
 * Enterprise payment service with Stripe integration for payment method management,
 * payment processing, and transaction tracking.
 */

import Stripe from 'stripe';
import { query } from '../db';

// Initialize Stripe lazily — only when a real key is present
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('your_') || key.startsWith('sk_test_your')) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
  }
  return new Stripe(key, { apiVersion: '2024-11-20.acacia' });
}

export interface PaymentMethod {
  id: string;
  userId: string;
  organizationId: string;
  stripePaymentMethodId: string;
  type: 'card' | 'bank_account';
  isDefault: boolean;
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  bankName?: string;
  bankLast4?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  organizationId: string;
  invoiceId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodType: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentService {
  /**
   * Create payment method
   */
  async createPaymentMethod(
    userId: string,
    organizationId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    // Get payment method details from Stripe
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Get or create customer
    const customerResult = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    let customerId = customerResult[0]?.stripe_customer_id;
    if (!customerId) {
      // Create customer
      const customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      customerId = customer.id;

      // Store customer ID
      await query(
        `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
        [customerId, userId]
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Store in database
    const result = await query(
      `INSERT INTO payment_methods (
        user_id, organization_id, stripe_payment_method_id, type,
        is_default, card_last4, card_brand, card_exp_month,
        card_exp_year, bank_name, bank_last4, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        userId,
        organizationId,
        paymentMethodId,
        stripePaymentMethod.type,
        true, // Set as default
        stripePaymentMethod.card?.last4,
        stripePaymentMethod.card?.brand,
        stripePaymentMethod.card?.exp_month,
        stripePaymentMethod.card?.exp_year,
        stripePaymentMethod.us_bank_account?.bank_name,
        stripePaymentMethod.us_bank_account?.last4,
      ]
    );

    return result[0];
  }

  /**
   * Get payment methods for user
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const result = await query(
      `SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return result;
  }

  /**
   * Get payment methods for organization
   */
  async getOrganizationPaymentMethods(
    organizationId: string
  ): Promise<PaymentMethod[]> {
    const result = await query(
      `SELECT * FROM payment_methods WHERE organization_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [organizationId]
    );

    return result;
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    // Get customer ID
    const customerResult = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    const customerId = customerResult[0]?.stripe_customer_id;
    if (!customerId) {
      throw new Error('Customer not found');
    }

    // Update in Stripe
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update in database
    await query(
      `UPDATE payment_methods 
       SET is_default = CASE WHEN stripe_payment_method_id = $1 THEN true ELSE false END
       WHERE user_id = $2`,
      [paymentMethodId, userId]
    );
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    // Get customer ID
    const customerResult = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    const customerId = customerResult[0]?.stripe_customer_id;
    if (!customerId) {
      throw new Error('Customer not found');
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Delete from database
    await query(
      `DELETE FROM payment_methods WHERE id = $1 AND user_id = $2`,
      [paymentMethodId, userId]
    );
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    userId: string,
    organizationId: string,
    invoiceId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<Payment> {
    // Get customer ID
    const customerResult = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    const customerId = customerResult[0]?.stripe_customer_id;
    if (!customerId) {
      throw new Error('Customer not found');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        invoiceId,
        organizationId,
      },
    });

    // Store in database
    const result = await query(
      `INSERT INTO payments (
        user_id, organization_id, invoice_id, stripe_payment_intent_id,
        amount, currency, status, payment_method_type, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
      RETURNING *`,
      [
        userId,
        organizationId,
        invoiceId,
        paymentIntent.id,
        amount,
        currency,
        paymentIntent.payment_method_types?.[0] || 'unknown',
      ]
    );

    return result[0];
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string
  ): Promise<Payment> {
    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update in database
    const result = await query(
      `UPDATE payments 
       SET status = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2
       RETURNING *`,
      [paymentIntent.status, paymentIntentId]
    );

    return result[0];
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    const result = await query(
      `SELECT * FROM payments WHERE id = $1`,
      [paymentId]
    );

    return result[0] || null;
  }

  /**
   * Get payments for user
   */
  async getUserPayments(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Payment[]> {
    const result = await query(
      `SELECT * FROM payments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result;
  }

  /**
   * Get payments for organization
   */
  async getOrganizationPayments(
    organizationId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Payment[]> {
    const result = await query(
      `SELECT * FROM payments 
       WHERE organization_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );

    return result;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    averagePaymentAmount: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as successful_amount,
        SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed_amount,
        AVG(amount) as average_payment_amount
       FROM payments
       WHERE organization_id = $1
         AND created_at >= $2
         AND created_at <= $3`,
      [organizationId, startDate, endDate]
    );

    const stats = result[0];

    return {
      totalPayments: parseInt(stats.total_payments) || 0,
      totalAmount: parseFloat(stats.total_amount) || 0,
      successfulPayments: parseInt(stats.successful_amount) || 0,
      failedPayments: parseInt(stats.failed_amount) || 0,
      averagePaymentAmount: parseFloat(stats.average_payment_amount) || 0,
    };
  }

  /**
   * Handle Stripe webhook events for payments
   */
  async handlePaymentWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Update payment status in database
    await query(
      `UPDATE payments 
       SET status = 'succeeded', updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    // Update invoice status if linked
    if (paymentIntent.metadata.invoiceId) {
      await query(
        `UPDATE invoices 
         SET status = 'paid', paid_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [paymentIntent.metadata.invoiceId]
      );
    }
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Update payment status in database
    await query(
      `UPDATE payments 
       SET status = 'failed', failure_reason = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2`,
      [paymentIntent.last_payment_error?.message || 'Unknown error', paymentIntent.id]
    );

    // Create billing alert
    if (paymentIntent.metadata.organizationId) {
      await query(
        `INSERT INTO billing_alerts (
          user_id, organization_id, type, severity, message, is_read, created_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW())`,
        [
          paymentIntent.metadata.userId,
          paymentIntent.metadata.organizationId,
          'payment_failed',
          'error',
          `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
        ]
      );
    }
  }

  /**
   * Handle payment intent canceled
   */
  private async handlePaymentIntentCanceled(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Update payment status in database
    await query(
      `UPDATE payments 
       SET status = 'canceled', updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
