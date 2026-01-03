import Paystack from 'paystack-node';
import { query } from '../db';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');

export interface PaymentInitData {
  amount: number;
  email: string;
  reference?: string;
  metadata?: any;
  callback_url?: string;
}

export interface PaymentVerification {
  reference: string;
}

export class PaymentService {
  static async initializePayment(data: PaymentInitData) {
    try {
      const response = await paystack.transaction.initialize({
        amount: data.amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        email: data.email,
        reference: data.reference,
        metadata: data.metadata,
        callback_url: data.callback_url,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack initialization error:', error);
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await paystack.transaction.verify(reference);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  }

  static async createOrder(listingId: string, buyerId: string, quantity: number, amount: number) {
    try {
      const result = await query(
        `INSERT INTO orders (listing_id, buyer_id, quantity, amount, payment_status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [listingId, buyerId, quantity, amount, 'pending']
      );

      return {
        success: true,
        order: result.rows[0],
      };
    } catch (error: any) {
      console.error('Order creation error:', error);
      return {
        success: false,
        error: error.message || 'Order creation failed',
      };
    }
  }

  static async updateOrderStatus(orderId: string, status: string, paystackRef?: string) {
    try {
      const result = await query(
        `UPDATE orders SET payment_status = $1, payment_ref = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [status, paystackRef || null, orderId]
      );

      if (result.rows.length > 0) {
        // Also create/update payment record
        await query(
          `INSERT INTO payments (order_id, paystack_ref, amount, status, metadata)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (paystack_ref) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = NOW()`,
          [orderId, paystackRef, result.rows[0].amount, status, { updated_at: new Date() }]
        );
      }

      return {
        success: true,
        order: result.rows[0],
      };
    } catch (error: any) {
      console.error('Order status update error:', error);
      return {
        success: false,
        error: error.message || 'Order status update failed',
      };
    }
  }

  static async getOrderById(orderId: string) {
    try {
      const result = await query('SELECT * FROM orders WHERE id = $1', [orderId]);

      return {
        success: true,
        order: result.rows[0] || null,
      };
    } catch (error: any) {
      console.error('Order fetch error:', error);
      return {
        success: false,
        error: error.message || 'Order fetch failed',
      };
    }
  }

  static async getPaymentByReference(reference: string) {
    try {
      const result = await query('SELECT * FROM payments WHERE paystack_ref = $1', [reference]);

      return {
        success: true,
        payment: result.rows[0] || null,
      };
    } catch (error: any) {
      console.error('Payment fetch error:', error);
      return {
        success: false,
        error: error.message || 'Payment fetch failed',
      };
    }
  }
}