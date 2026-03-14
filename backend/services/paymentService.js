const axios = require('axios');
const Payment = require('../models/Payment');
const User = require('../models/User');

class PaymentService {
  constructor() {
    this.baseURL = 'https://api.flutterwave.com/v3';
    this.secretKey = process.env.FLW_SECRET_KEY;
  }

  async initializePayment(userId, plan, email) {
    const amounts = {
      weekly: parseFloat(process.env.PLAN_WEEKLY_PRICE),
      monthly: parseFloat(process.env.PLAN_MONTHLY_PRICE),
      quarterly: parseFloat(process.env.PLAN_QUARTERLY_PRICE),
      yearly: parseFloat(process.env.PLAN_YEARLY_PRICE)
    };

    const amount = amounts[plan];
    if (!amount) throw new Error('Invalid plan selected');

    const txRef = `WIZAI_${Date.now()}_${userId.toString().slice(-6)}`;

    const payment = await Payment.create({
      userId,
      plan,
      amount,
      transactionId: txRef,
      customerEmail: email
    });

    // Use direct API call instead of library
    const payload = {
      tx_ref: txRef,
      amount: amount,
      currency: 'USD',
      redirect_url: `${process.env.FRONTEND_URL}/payment/verify`,
      payment_options: 'card,account,ussd',
      meta: {
        userId: userId.toString(),
        plan: plan
      },
      customer: {
        email: email,
        name: email.split('@')[0]
      },
      customizations: {
        title: 'Wiz AI Premium',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        logo: 'https://wizai.com/logo.png'
      }
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        paymentLink: response.data.data.link,
        transactionRef: txRef,
        paymentId: payment._id
      };
    } catch (error) {
      await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
      throw new Error('Payment initialization failed: ' + error.message);
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      if (response.data.data.status === 'successful') {
        const payment = await Payment.findOneAndUpdate(
          { transactionId: response.data.data.tx_ref },
          { 
            status: 'successful',
            completedAt: new Date(),
            flwRef: response.data.data.id
          },
          { new: true }
        );

        if (payment) {
          await this.activateSubscription(payment.userId, payment.plan);
        }

        return { success: true, payment };
      }

      await Payment.findOneAndUpdate(
        { transactionId: response.data.data.tx_ref },
        { status: 'failed' }
      );

      return { success: false };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async activateSubscription(userId, plan) {
    const durations = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };

    const days = durations[plan];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    await User.findByIdAndUpdate(userId, {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.startDate': startDate,
      'subscription.endDate': endDate
    });
  }

  async handleWebhook(payload) {
    // Verify webhook signature if needed
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      await this.verifyPayment(payload.data.id);
    }
    return { received: true };
  }
}

module.exports = new PaymentService();
