import express from 'express';
import { PaymentService } from '../services/payment';
import { query } from '../db';

const router = express.Router();

// Initialize payment
router.post('/initialize', async (req, res) => {
  try {
    const { listingId, quantity, buyerId, email, amount } = req.body;

    if (!listingId || !quantity || !buyerId || !email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listingId, quantity, buyerId, email, amount'
      });
    }

    // Create order first
    const orderResult = await PaymentService.createOrder(listingId, buyerId, quantity, amount);
    if (!orderResult.success) {
      return res.status(500).json(orderResult);
    }

    // Generate unique reference
    const reference = `atlas_${orderResult.order.id}_${Date.now()}`;

    // Initialize payment with Paystack
    const paymentResult = await PaymentService.initializePayment({
      amount: amount,
      email: email,
      reference: reference,
      metadata: {
        orderId: orderResult.order.id,
        listingId: listingId,
        quantity: quantity,
        buyerId: buyerId,
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
    });

    if (!paymentResult.success) {
      return res.status(500).json(paymentResult);
    }

    // Update order with payment reference
    await PaymentService.updateOrderStatus(orderResult.order.id, 'pending', reference);

    res.json({
      success: true,
      order: orderResult.order,
      payment: paymentResult.data,
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment initialization failed'
    });
  }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    // Verify with Paystack
    const verificationResult = await PaymentService.verifyPayment(reference);
    if (!verificationResult.success) {
      return res.status(500).json(verificationResult);
    }

    const paymentData = verificationResult.data;

    // Get order from metadata
    const orderId = paymentData.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID not found in payment metadata'
      });
    }

    // Update order status based on payment status
    const status = paymentData.status === 'success' ? 'completed' : 'failed';
    const updateResult = await PaymentService.updateOrderStatus(orderId, status, reference);

    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.json({
      success: true,
      payment: paymentData,
      order: updateResult.order,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
});

// Webhook handler for Paystack
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = require('crypto').createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const orderId = event.data.metadata?.orderId;

      if (orderId) {
        await PaymentService.updateOrderStatus(orderId, 'completed', reference);
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Webhook processing failed'
    });
  }
});

// Get payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await PaymentService.getOrderById(orderId);
    if (!orderResult.success) {
      return res.status(500).json(orderResult);
    }

    if (!orderResult.order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: orderResult.order,
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment status check failed'
    });
  }
});

export default router;