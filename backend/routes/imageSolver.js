const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const checkSubscription = require('../middleware/checkSubscription');
const upload = require('../middleware/upload');
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const User = require('../models/User');

router.post('/', auth, aiRateLimiter, checkSubscription, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    // Check limits
    if (!req.isPremium && req.user.dailyUsage.imageSolves >= req.userLimits.imageSolves) {
      return res.status(403).json({ 
        error: 'Daily image solve limit reached. Upgrade to Premium for unlimited access.',
        upgrade: true
      });
    }

    // Process image with OCR
    const ocrResult = await ocrService.processHomeworkImage(req.file.buffer);
    
    // Generate AI explanation
    const aiResult = await aiService.generateResponse(
      `Solve this homework problem extracted from an image: ${ocrResult.text}`,
      'image',
      req.user._id
    );

    // Update usage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'dailyUsage.imageSolves': 1,
        'stats.totalImages': 1
      }
    });

    res.json({
      extractedText: ocrResult.text,
      solution: aiResult.response,
      confidence: ocrResult.confidence,
      remaining: req.isPremium ? 'unlimited' : req.userLimits.imageSolves - req.user.dailyUsage.imageSolves - 1
    });
  } catch (error) {
    console.error('Image Solver Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

module.exports = router;
