const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');

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

// Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = {
      body: req.body,
      headers: req.headers,
      event: req.body.event
    };
    
    await paymentService.handleWebhook(payload);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
