const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const crypto = require('crypto');

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['weekly', 'monthly', 'quarterly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const result = await paymentService.initializePayment(
      req.user._id,
      plan,
      req.user.email
    );

    res.json(result);
  } catch (error) {
    console.error('Payment Init Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify payment
router.get('/verify/:transactionId', auth, async (req, res) => {
  try {
    const result = await paymentService.verifyPayment(req.params.transactionId);
    res.json(result);
  } catch (error) {
    console.error('Payment Verify Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Webhook - SECURED WITH SIGNATURE VERIFICATION
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Get signature from headers
    const signature = req.headers['verif-hash'];
    const secretHash = process.env.FLW_WEBHOOK_SECRET;
    
    // Verify signature
    if (!signature) {
      console.log('No signature provided');
      return res.status(401).json({ error: 'No signature' });
    }
    
    if (signature !== secretHash) {
      console.log('Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the raw body
    const payload = JSON.parse(req.body);
    console.log('Webhook received:', payload.event);
    
    // Handle successful payment
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      await paymentService.verifyPayment(payload.data.id);
      console.log('Payment verified and subscription activated');
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
