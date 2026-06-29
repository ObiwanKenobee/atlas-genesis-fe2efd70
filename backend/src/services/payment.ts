/**
 * Payment Service
 * 
 * Enterprise payment service with Stripe integration for payment method management,
 * payment processing, and transaction tracking.
 */

import Stripe from 'stripe';
import { query } from '../db';
import crypto from 'crypto';

// Initialize Stripe lazily — only when a real key is present
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('your_') || key.startsWith('sk_test_your')) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
  }
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

// ─── Static helper types used by route files ──────────────────────────────────

export type SupportedPaymentMethod =
  | 'paystack' | 'paypal' | 'stripe' | 'card' | 'bank'
  | 'coinbase-commerce' | 'metamask' | 'eth' | 'btc' | 'usdc'
  | 'usdt' | 'cardano' | 'matic' | 'flutterwave';

export interface InitializePaymentOptions {
  amount: number;
  email: string;
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  paymentMethod?: SupportedPaymentMethod;
  currency?: string;
}

export interface OrderRecord {
  id: string;
  listing_id: string;
  buyer_id: string;
  quantity: number;
  price_amount: number;
  status: string;
  payment_reference?: string;
  payment_method?: string;
  created_at: string;
}

// ─── Static marketplace helpers ───────────────────────────────────────────────

async function createOrder(
  listingId: string,
  buyerId: string,
  quantity: number,
  amount: number
): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  try {
    const result = await query(
      `INSERT INTO orders (listing_id, buyer_id, quantity, price_amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'created', NOW()) RETURNING *`,
      [listingId, buyerId, quantity, amount]
    );
    return { success: true, order: result.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function initializePayment(
  opts: InitializePaymentOptions
): Promise<{ success: boolean; data?: any; paymentMethod?: string; error?: string }> {
  const method = opts.paymentMethod || 'paystack';
  try {
    if (method === 'paystack' || method === 'card' || method === 'bank') {
      const key = process.env.PAYSTACK_SECRET_KEY;
      if (!key) throw new Error('PAYSTACK_SECRET_KEY not configured');
      const amountKobo = Math.round(opts.amount * 100);
      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: opts.email,
          amount: amountKobo,
          currency: opts.currency === 'USD' ? 'USD' : 'NGN',
          reference: opts.reference,
          callback_url: opts.callback_url,
          metadata: opts.metadata,
          channels: ['card', 'bank', 'ussd', 'bank_transfer'],
        }),
      });
      const data = await res.json() as any;
      if (!data.status) throw new Error(data.message || 'Paystack init failed');
      return { success: true, data: data.data, paymentMethod: 'paystack' };
    }

    if (method === 'stripe') {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: (opts.currency || 'usd').toLowerCase(),
            unit_amount: Math.round(opts.amount * 100),
            product_data: { name: 'Carbon Credits' },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: opts.callback_url || `${process.env.FRONTEND_URL}/pricing?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
        customer_email: opts.email,
        metadata: opts.metadata as Record<string, string>,
      });
      return { success: true, data: { authorization_url: session.url, reference: session.id }, paymentMethod: 'stripe' };
    }

    if (method === 'paypal') {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured');
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json() as any;
      const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: opts.reference,
            amount: { currency_code: opts.currency || 'USD', value: opts.amount.toFixed(2) },
            custom_id: JSON.stringify(opts.metadata || {}),
          }],
          application_context: {
            return_url: opts.callback_url || `${process.env.FRONTEND_URL}/pricing?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
            user_action: 'PAY_NOW',
          },
        }),
      });
      const orderData = await orderRes.json() as any;
      if (!orderRes.ok) throw new Error(orderData.message || 'PayPal order failed');
      const approvalLink = orderData.links?.find((l: any) => l.rel === 'approve');
      return { success: true, data: { authorization_url: approvalLink?.href, reference: orderData.id }, paymentMethod: 'paypal' };
    }

    // Crypto/wallet — return pending, handled on-chain
    return {
      success: true,
      data: { reference: opts.reference, status: 'pending', message: 'Complete payment on-chain' },
      paymentMethod: method,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function updateOrderStatus(
  orderId: string,
  status: string,
  reference?: string,
  method?: string
): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  try {
    const result = await query(
      `UPDATE orders SET status = $1, payment_reference = COALESCE($2, payment_reference),
       payment_method = COALESCE($3, payment_method), updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, reference || null, method || null, orderId]
    );
    return { success: true, order: result.rows[0] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function getOrderById(orderId: string): Promise<{ success: boolean; order?: OrderRecord; error?: string }> {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    return { success: true, order: result.rows[0] || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function verifyPayment(
  reference: string,
  method: SupportedPaymentMethod = 'paystack'
): Promise<{ success: boolean; data?: any; paymentMethod?: string; error?: string }> {
  try {
    if (method === 'paystack' || method === 'card' || method === 'bank') {
      const key = process.env.PAYSTACK_SECRET_KEY;
      if (!key) throw new Error('PAYSTACK_SECRET_KEY not configured');
      const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await res.json() as any;
      if (!data.status) throw new Error(data.message || 'Verification failed');
      return { success: true, data: { ...data.data, status: data.data.status === 'success' ? 'success' : 'failed' }, paymentMethod: 'paystack' };
    }

    if (method === 'stripe') {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(reference);
      return {
        success: true,
        data: { status: session.payment_status === 'paid' ? 'success' : 'failed', metadata: session.metadata },
        paymentMethod: 'stripe',
      };
    }

    return { success: false, error: `Verification not supported for ${method}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Expose as static-style namespace for existing route imports
export const PaymentService = { createOrder, initializePayment, updateOrderStatus, getOrderById, verifyPayment };

export interface PaymentMethodRecord {
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

export interface PaymentRecord {
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

export class PaymentServiceClass {
  /**
   * Create payment method
   */
  async createPaymentMethod(
    userId: string,
    organizationId: string,
    paymentMethodId: string
  ): Promise<PaymentMethodRecord> {
    const stripe = getStripe();
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
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
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
  ): Promise<PaymentMethodRecord[]> {
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

    const stripe = getStripe();
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
    const stripe = getStripe();
    // Get customer ID
    const customerResult = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    const customerId = customerResult[0]?.stripe_customer_id;
    if (!customerId) {
      throw new Error('Customer not found');
    }

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
  ): Promise<PaymentRecord> {
    const stripe = getStripe();
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
  ): Promise<PaymentRecord> {
    const stripe = getStripe();
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
  async getPayment(paymentId: string): Promise<PaymentRecord | null> {
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
  ): Promise<PaymentRecord[]> {
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
  ): Promise<PaymentRecord[]> {
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
export const paymentService = new PaymentServiceClass();
