/**
 * Billing Service
 * 
 * Enterprise billing service with Stripe integration for subscription management,
 * usage tracking, and billing operations.
 */

import Stripe from 'stripe';
import { query } from '../db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  apiCallsLimit: number;
  storageLimit: number;
  teamMembersLimit: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  userId: string;
  organizationId: string;
  metric: string;
  quantity: number;
  periodStart: Date;
  periodEnd: Date;
  recordedAt: Date;
}

export interface BillingAlert {
  id: string;
  userId: string;
  organizationId: string;
  type: 'usage_threshold' | 'payment_failed' | 'subscription_expiring' | 'budget_exceeded';
  severity: 'info' | 'warning' | 'error';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export class BillingService {
  /**
   * Create a Stripe customer
   */
  async createCustomer(
    userId: string,
    email: string,
    organizationId?: string
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
        organizationId: organizationId || '',
      },
    });

    // Store customer ID in database
    await query(
      `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
      [customer.id, userId]
    );

    if (organizationId) {
      await query(
        `UPDATE organizations SET stripe_customer_id = $1 WHERE id = $2`,
        [customer.id, organizationId]
      );
    }

    return customer;
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    organizationId?: string
  ): Promise<Stripe.Customer> {
    // Check if customer already exists
    const result = await query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [userId]
    );

    if (result.length > 0 && result[0].stripe_customer_id) {
      return await stripe.customers.retrieve(result[0].stripe_customer_id) as Stripe.Customer;
    }

    // Create new customer
    return await this.createCustomer(userId, email, organizationId);
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    userId: string,
    organizationId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    // Get plan details
    const planResult = await query(
      `SELECT * FROM billing_plans WHERE id = $1 AND is_active = true`,
      [planId]
    );

    if (planResult.length === 0) {
      throw new Error('Plan not found');
    }

    const plan = planResult[0];

    // Get or create customer
    const customer = await this.getOrCreateCustomer(
      userId,
      '', // Email will be fetched from user table
      organizationId
    );

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in database
    const dbResult = await query(
      `INSERT INTO subscriptions (
        user_id, organization_id, plan_id, stripe_subscription_id,
        stripe_customer_id, status, current_period_start, current_period_end,
        cancel_at_period_end, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        userId,
        organizationId,
        planId,
        subscription.id,
        customer.id,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
      ]
    );

    return dbResult[0];
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    planId: string
  ): Promise<Subscription> {
    // Get current subscription
    const currentResult = await query(
      `SELECT * FROM subscriptions WHERE id = $1`,
      [subscriptionId]
    );

    if (currentResult.length === 0) {
      throw new Error('Subscription not found');
    }

    const current = currentResult[0];

    // Get new plan details
    const planResult = await query(
      `SELECT * FROM billing_plans WHERE id = $1 AND is_active = true`,
      [planId]
    );

    if (planResult.length === 0) {
      throw new Error('Plan not found');
    }

    const plan = planResult[0];

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(
      current.stripe_subscription_id
    );

    const updatedSubscription = await stripe.subscriptions.update(
      current.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: plan.stripe_price_id,
          },
        ],
      }
    );

    // Update in database
    const dbResult = await query(
      `UPDATE subscriptions 
       SET plan_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [planId, subscriptionId]
    );

    return dbResult[0];
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    // Get subscription
    const result = await query(
      `SELECT * FROM subscriptions WHERE id = $1`,
      [subscriptionId]
    );

    if (result.length === 0) {
      throw new Error('Subscription not found');
    }

    const subscription = result[0];

    // Cancel in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
      }
    );

    // Update in database
    const dbResult = await query(
      `UPDATE subscriptions 
       SET cancel_at_period_end = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [cancelAtPeriodEnd, subscriptionId]
    );

    return dbResult[0];
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    // Get subscription
    const result = await query(
      `SELECT * FROM subscriptions WHERE id = $1`,
      [subscriptionId]
    );

    if (result.length === 0) {
      throw new Error('Subscription not found');
    }

    const subscription = result[0];

    // Resume in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update in database
    const dbResult = await query(
      `UPDATE subscriptions 
       SET cancel_at_period_end = false, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [subscriptionId]
    );

    return dbResult[0];
  }

  /**
   * Get subscription for user
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const result = await query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    return result[0] || null;
  }

  /**
   * Get subscription for organization
   */
  async getOrganizationSubscription(
    organizationId: string
  ): Promise<Subscription | null> {
    const result = await query(
      `SELECT * FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organizationId]
    );

    return result[0] || null;
  }

  /**
   * Get all billing plans
   */
  async getBillingPlans(): Promise<BillingPlan[]> {
    const result = await query(
      `SELECT * FROM billing_plans WHERE is_active = true ORDER BY amount ASC`
    );

    return result;
  }

  /**
   * Get billing plan by ID
   */
  async getBillingPlan(planId: string): Promise<BillingPlan | null> {
    const result = await query(
      `SELECT * FROM billing_plans WHERE id = $1`,
      [planId]
    );

    return result[0] || null;
  }

  /**
   * Record usage
   */
  async recordUsage(
    subscriptionId: string,
    userId: string,
    organizationId: string,
    metric: string,
    quantity: number
  ): Promise<void> {
    // Get current period
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription) {
      throw new Error('No active subscription');
    }

    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;

    // Check if usage record already exists for this period
    const existingResult = await query(
      `SELECT * FROM usage_records 
       WHERE subscription_id = $1 
         AND metric = $2 
         AND period_start = $3 
         AND period_end = $4`,
      [subscriptionId, metric, periodStart, periodEnd]
    );

    if (existingResult.length > 0) {
      // Update existing record
      await query(
        `UPDATE usage_records 
         SET quantity = quantity + $1, recorded_at = NOW()
         WHERE id = $2`,
        [quantity, existingResult[0].id]
      );
    } else {
      // Create new record
      await query(
        `INSERT INTO usage_records (
          subscription_id, user_id, organization_id, metric, quantity,
          period_start, period_end, recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [subscriptionId, userId, organizationId, metric, quantity, periodStart, periodEnd]
      );
    }

    // Check for usage alerts
    await this.checkUsageAlerts(subscriptionId, organizationId, metric);
  }

  /**
   * Get usage for subscription
   */
  async getUsage(
    subscriptionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageRecord[]> {
    const result = await query(
      `SELECT * FROM usage_records 
       WHERE subscription_id = $1 
         AND period_start >= $2 
         AND period_end <= $3
       ORDER BY period_start DESC`,
      [subscriptionId, startDate, endDate]
    );

    return result;
  }

  /**
   * Get usage summary
   */
  async getUsageSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, { quantity: number; limit: number; percentage: number }>> {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription) {
      return {};
    }

    const plan = await this.getBillingPlan(subscription.planId);
    if (!plan) {
      return {};
    }

    const result = await query(
      `SELECT 
        metric,
        SUM(quantity) as total_quantity
       FROM usage_records
       WHERE organization_id = $1
         AND period_start >= $2
         AND period_end <= $3
       GROUP BY metric`,
      [organizationId, startDate, endDate]
    );

    const summary: Record<string, { quantity: number; limit: number; percentage: number }> = {};

    // Define limits based on plan
    const limits: Record<string, number> = {
      api_calls: plan.apiCallsLimit,
      storage: plan.storageLimit,
      team_members: plan.teamMembersLimit,
    };

    result.forEach((row: any) => {
      const limit = limits[row.metric] || 0;
      const percentage = limit > 0 ? (row.total_quantity / limit) * 100 : 0;

      summary[row.metric] = {
        quantity: parseInt(row.total_quantity),
        limit,
        percentage,
      };
    });

    return summary;
  }

  /**
   * Check for usage alerts
   */
  private async checkUsageAlerts(
    subscriptionId: string,
    organizationId: string,
    metric: string
  ): Promise<void> {
    const subscription = await this.getOrganizationSubscription(organizationId);
    if (!subscription) {
      return;
    }

    const plan = await this.getBillingPlan(subscription.planId);
    if (!plan) {
      return;
    }

    const limits: Record<string, number> = {
      api_calls: plan.apiCallsLimit,
      storage: plan.storageLimit,
      team_members: plan.teamMembersLimit,
    };

    const limit = limits[metric];
    if (!limit) {
      return;
    }

    // Get current usage
    const result = await query(
      `SELECT SUM(quantity) as total_quantity
       FROM usage_records
       WHERE subscription_id = $1 AND metric = $2`,
      [subscriptionId, metric]
    );

    const currentUsage = parseInt(result[0]?.total_quantity || 0);
    const percentage = (currentUsage / limit) * 100;

    // Create alert if threshold exceeded
    if (percentage >= 90) {
      await this.createAlert(
        subscription.userId,
        organizationId,
        'usage_threshold',
        percentage >= 100 ? 'error' : 'warning',
        `${metric} usage is at ${percentage.toFixed(0)}% of limit (${currentUsage}/${limit})`
      );
    }
  }

  /**
   * Create billing alert
   */
  async createAlert(
    userId: string,
    organizationId: string,
    type: BillingAlert['type'],
    severity: BillingAlert['severity'],
    message: string
  ): Promise<void> {
    await query(
      `INSERT INTO billing_alerts (
        user_id, organization_id, type, severity, message, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [userId, organizationId, type, severity, message]
    );
  }

  /**
   * Get alerts for user
   */
  async getAlerts(userId: string): Promise<BillingAlert[]> {
    const result = await query(
      `SELECT * FROM billing_alerts 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    return result;
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    await query(
      `UPDATE billing_alerts SET is_read = true WHERE id = $1`,
      [alertId]
    );
  }

  /**
   * Get billing summary
   */
  async getBillingSummary(
    organizationId: string
  ): Promise<{
    currentPlan: BillingPlan | null;
    subscription: Subscription | null;
    usage: Record<string, { quantity: number; limit: number; percentage: number }>;
    upcomingInvoice: any;
  }> {
    const subscription = await this.getOrganizationSubscription(organizationId);
    const currentPlan = subscription
      ? await this.getBillingPlan(subscription.planId)
      : null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await this.getUsageSummary(
      organizationId,
      startOfMonth,
      now
    );

    let upcomingInvoice = null;
    if (subscription) {
      const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        status: 'open',
        limit: 1,
      });

      upcomingInvoice = invoices.data[0] || null;
    }

    return {
      currentPlan,
      subscription,
      usage,
      upcomingInvoice,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice
  ): Promise<void> {
    // Update subscription status
    if (invoice.subscription) {
      await query(
        `UPDATE subscriptions 
         SET status = 'active', updated_at = NOW()
         WHERE stripe_subscription_id = $1`,
        [invoice.subscription as string]
      );
    }
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice
  ): Promise<void> {
    // Update subscription status
    if (invoice.subscription) {
      await query(
        `UPDATE subscriptions 
         SET status = 'past_due', updated_at = NOW()
         WHERE stripe_subscription_id = $1`,
        [invoice.subscription as string]
      );

      // Get subscription to create alert
      const result = await query(
        `SELECT * FROM subscriptions WHERE stripe_subscription_id = $1`,
        [invoice.subscription as string]
      );

      if (result.length > 0) {
        await this.createAlert(
          result[0].userId,
          result[0].organizationId,
          'payment_failed',
          'error',
          `Payment failed for invoice ${invoice.id}. Please update your payment method.`
        );
      }
    }
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    // Subscription is already created in our database
    // This webhook is for notification purposes
    console.log(`Subscription created: ${subscription.id}`);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    await query(
      `UPDATE subscriptions 
       SET status = $1, 
           current_period_start = $2,
           current_period_end = $3,
           cancel_at_period_end = $4,
           updated_at = NOW()
       WHERE stripe_subscription_id = $5`,
      [
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        subscription.id,
      ]
    );
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    await query(
      `UPDATE subscriptions 
       SET status = 'canceled', updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );
  }
}

// Export singleton instance
export const billingService = new BillingService();
