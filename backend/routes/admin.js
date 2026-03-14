const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Payment = require('../models/Payment');
const AiUsageLog = require('../models/AiUsageLog');
const QuizQuestion = require('../models/QuizQuestion');

// Admin login - check against env variables
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Debug log (remove in production)
    console.log('Admin login attempt:', email);
    console.log('Expected:', process.env.ADMIN_EMAIL);
    
    // Check credentials against env variables
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      console.log('Invalid credentials');
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate admin token
    const token = jwt.sign(
      { id: 'admin', role: 'admin', email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Admin login successful');
    res.json({ token, admin: true });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [
      totalUsers,
      premiumUsers,
      todayRevenue,
      aiUsageToday,
      quizStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'subscription.plan': { $ne: 'free' }, 'subscription.status': 'active' }),
      Payment.aggregate([
        { 
          $match: { 
            status: 'successful',
            completedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      AiUsageLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      {
        totalQuestions: await QuizQuestion.countDocuments(),
        activeQuestions: await QuizQuestion.countDocuments({ isActive: true })
      }
    ]);

    res.json({
      users: { total: totalUsers, premium: premiumUsers },
      revenue: { today: todayRevenue[0]?.total || 0 },
      aiUsage: { today: aiUsageToday },
      quiz: quizStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user subscription
router.patch('/users/:id/subscription', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { plan, status, endDate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'subscription.plan': plan,
        'subscription.status': status,
        'subscription.endDate': new Date(endDate)
      },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Get AI usage logs
router.get('/ai-logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const logs = await AiUsageLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'email username');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Add quiz question
router.post('/quiz-questions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const question = await QuizQuestion.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Toggle feature
router.post('/toggle-feature', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { feature, enabled } = req.body;
    global.featureToggles = global.featureToggles || {};
    global.featureToggles[feature] = enabled;
    res.json({ feature, enabled });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

module.exports = router;
