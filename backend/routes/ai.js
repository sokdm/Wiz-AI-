const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const checkSubscription = require('../middleware/checkSubscription');
const aiService = require('../services/aiService');
const User = require('../models/User');

// Solve homework
router.post('/solve', auth, aiRateLimiter, checkSubscription, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a valid question' });
    }

    // Check limits
    if (!req.isPremium && req.user.dailyUsage.aiQuestions >= req.userLimits.aiQuestions) {
      return res.status(403).json({ 
        error: 'Daily AI limit reached. Upgrade to Premium for unlimited access.',
        upgrade: true
      });
    }

    const result = await aiService.generateResponse(question, 'homework', req.user._id);

    // Update usage
    if (!result.cached) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 
          'dailyUsage.aiQuestions': 1,
          'stats.totalAiQuestions': 1
        }
      });
    }

    res.json({
      answer: result.response,
      cached: result.cached,
      remaining: req.isPremium ? 'unlimited' : req.userLimits.aiQuestions - req.user.dailyUsage.aiQuestions - (result.cached ? 0 : 1)
    });
  } catch (error) {
    console.error('AI Solve Error:', error);
    res.status(500).json({ error: 'Failed to process your question' });
  }
});

// Tutor chat
router.post('/tutor', auth, aiRateLimiter, checkSubscription, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || message.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a message' });
    }

    if (!req.isPremium && req.user.dailyUsage.aiQuestions >= req.userLimits.aiQuestions) {
      return res.status(403).json({ 
        error: 'Daily AI limit reached. Upgrade to Premium for unlimited access.',
        upgrade: true
      });
    }

    const result = await aiService.generateResponse(message, 'tutor', req.user._id);

    if (!result.cached) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 
          'dailyUsage.aiQuestions': 1,
          'stats.totalAiQuestions': 1
        }
      });
    }

    res.json({
      response: result.response,
      cached: result.cached,
      conversationId
    });
  } catch (error) {
    console.error('Tutor Error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

module.exports = router;
