import Paystack from 'paystack-node';
import { query } from '../db';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '');

export type PaymentMethod = 'paystack' | 'stripe' | 'coinbase' | 'wallet';

export interface PaymentInitData {
  amount: number;
  email: string;
  reference?: string;
  metadata?: any;
  callback_url?: string;
  paymentMethod?: PaymentMethod;
  currency?: string; // Default: 'USD'
}

export interface PaymentVerification {
  reference: string;
  paymentMethod?: PaymentMethod;
}

export class PaymentService {
  static async initializePayment(data: PaymentInitData) {
    const { paymentMethod = 'paystack', currency = 'USD' } = data;

    try {
      if (paymentMethod === 'paystack') {
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
          paymentMethod,
        };
      } else if (paymentMethod === 'stripe') {
        // Stripe integration placeholder
        return {
          success: true,
          data: {
            reference: data.reference || `stripe_${Date.now()}`,
            authorization_url: '/stripe-checkout',
            payment_method: 'stripe',
          },
          paymentMethod,
        };
      } else if (paymentMethod === 'coinbase') {
        // Coinbase integration placeholder
        return {
          success: true,
          data: {
            reference: data.reference || `coinbase_${Date.now()}`,
            authorization_url: '/coinbase-checkout',
            payment_method: 'coinbase',
          },
          paymentMethod,
        };
      } else if (paymentMethod === 'wallet') {
        // Crypto wallet integration placeholder (e.g., MetaMask)
        return {
          success: true,
          data: {
            reference: data.reference || `wallet_${Date.now()}`,
            payment_method: 'wallet',
            network: 'ethereum',
            contract_address: process.env.CRYPTO_CONTRACT_ADDRESS,
          },
          paymentMethod,
        };
      } else {
        throw new Error('Unsupported payment method');
      }
    } catch (error: any) {
      console.error(`${paymentMethod} initialization error:`, error);
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  static async verifyPayment(reference: string, paymentMethod: PaymentMethod = 'paystack') {
    try {
      if (paymentMethod === 'paystack') {
        const response = await paystack.transaction.verify(reference);
        return {
          success: true,
          data: response.data,
          paymentMethod,
        };
      } else if (paymentMethod === 'stripe') {
        // Stripe verification placeholder
        return {
          success: true,
          data: {
            reference,
            status: 'success',
            payment_method: 'stripe',
          },
          paymentMethod,
        };
      } else if (paymentMethod === 'coinbase') {
        // Coinbase verification placeholder
        return {
          success: true,
          data: {
            reference,
            status: 'success',
            payment_method: 'coinbase',
          },
          paymentMethod,
        };
      } else if (paymentMethod === 'wallet') {
        // Crypto wallet verification placeholder
        return {
          success: true,
          data: {
            reference,
            status: 'success',
            payment_method: 'wallet',
          },
          paymentMethod,
        };
      } else {
        throw new Error('Unsupported payment method');
      }
    } catch (error: any) {
      console.error(`${paymentMethod} verification error:`, error);
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

  static async updateOrderStatus(orderId: string, status: string, paymentRef?: string, paymentMethod?: PaymentMethod) {
    try {
      const result = await query(
        `UPDATE orders SET payment_status = $1, payment_ref = $2, payment_method = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
        [status, paymentRef || null, paymentMethod || 'paystack', orderId]
      );

      if (result.rows.length > 0) {
        // Also create/update payment record
        await query(
          `INSERT INTO payments (order_id, payment_ref, payment_method, amount, status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (payment_ref) DO UPDATE SET
           status = EXCLUDED.status,
           payment_method = EXCLUDED.payment_method,
           updated_at = NOW()`,
          [orderId, paymentRef, paymentMethod || 'paystack', result.rows[0].amount, status, { updated_at: new Date() }]
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