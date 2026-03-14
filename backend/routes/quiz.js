const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const QuizQuestion = require('../models/QuizQuestion');
const QuizProgress = require('../models/QuizProgress');
const Leaderboard = require('../models/Leaderboard');
const aiService = require('../services/aiService');
const User = require('../models/User');

const PRIZE_LADDER = [0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];

// Start new game
router.get('/start', auth, checkSubscription, async (req, res) => {
  try {
    // Check daily limit for free users
    if (!req.isPremium) {
      const today = new Date().toDateString();
      let progress = await QuizProgress.findOne({ userId: req.user._id });
      
      if (progress && progress.gamesPlayedToday >= req.userLimits.quizGames) {
        return res.status(403).json({
          error: 'Daily quiz limit reached. Upgrade to Premium for unlimited games.',
          upgrade: true
        });
      }
    }

    // Reset or create progress
    let progress = await QuizProgress.findOneAndUpdate(
      { userId: req.user._id },
      {
        currentLevel: 1,
        currentScore: 0,
        lifelines: {
          fiftyFifty: req.isPremium ? 3 : 1,
          skip: req.isPremium ? 3 : 1,
          askAudience: req.isPremium ? 3 : 1
        },
        gameState: 'playing',
        questionsAnswered: [],
        lastPlayedDate: new Date(),
        $inc: { gamesPlayedToday: 1 }
      },
      { upsert: true, new: true }
    );

    // Get first question - level 1
    const question = await QuizQuestion.findOne({
      difficultyLevel: 1,
      isActive: true
    }).lean();

    if (!question) {
      console.error('No level 1 question found in database');
      return res.status(500).json({ error: 'No questions available. Please seed the database.' });
    }

    // Return full question data
    res.json({
      gameState: 'playing',
      currentLevel: 1,
      currentScore: 0,
      lifelines: {
        fiftyFifty: req.isPremium ? 3 : 1,
        skip: req.isPremium ? 3 : 1,
        askAudience: req.isPremium ? 3 : 1
      },
      question: {
        id: question._id.toString(),
        question: question.question,
        options: question.options,
        category: question.category
      }
    });
  } catch (error) {
    console.error('Quiz Start Error:', error);
    res.status(500).json({ error: 'Failed to start game: ' + error.message });
  }
});

// Get question by level
router.get('/question/:level', auth, async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    if (level < 1 || level > 15) {
      return res.status(400).json({ error: 'Invalid level' });
    }

    const progress = await QuizProgress.findOne({ userId: req.user._id });
    if (!progress || progress.gameState !== 'playing') {
      return res.status(400).json({ error: 'No active game. Please start a new game.' });
    }

    const question = await QuizQuestion.findOne({
      difficultyLevel: level,
      isActive: true,
      _id: { $nin: progress.questionsAnswered.map(q => q.questionId) }
    }).lean();

    if (!question) {
      return res.status(404).json({ error: 'No question available for this level' });
    }

    await QuizProgress.findByIdAndUpdate(progress._id, {
      currentQuestionId: question._id
    });

    res.json({
      id: question._id.toString(),
      question: question.question,
      options: question.options,
      category: question.category,
      level: level
    });
  } catch (error) {
    console.error('Get Question Error:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Submit answer
router.post('/answer', auth, async (req, res) => {
  try {
    const { questionId, answer, timeTaken } = req.body;
    
    const progress = await QuizProgress.findOne({ userId: req.user._id });
    if (!progress || progress.gameState !== 'playing') {
      return res.status(400).json({ error: 'No active game' });
    }

    const question = await QuizQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === answer;
    
    if (isCorrect) {
      const newLevel = progress.currentLevel + 1;
      const newScore = PRIZE_LADDER[newLevel - 1] || progress.currentScore;
      
      if (newLevel > 15) {
        // Game completed
        await handleGameComplete(req.user._id, progress, newScore, true);
        return res.json({
          correct: true,
          gameComplete: true,
          finalScore: newScore,
          message: 'Congratulations! You won 1,000,000 points!'
        });
      }

      await QuizProgress.findByIdAndUpdate(progress._id, {
        currentLevel: newLevel,
        currentScore: newScore,
        $push: { questionsAnswered: { questionId, correct: true, timeTaken } }
      });

      res.json({
        correct: true,
        currentLevel: newLevel,
        currentScore: newScore,
        safeLevels: [5, 10].includes(newLevel - 1)
      });
    } else {
      // Wrong answer - game over
      const finalScore = getSafeScore(progress.currentLevel);
      await handleGameComplete(req.user._id, progress, finalScore, false);
      
      res.json({
        correct: false,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        finalScore: finalScore,
        gameOver: true
      });
    }
  } catch (error) {
    console.error('Answer Error:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// Use lifeline
router.post('/lifeline/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    const progress = await QuizProgress.findOne({ userId: req.user._id });
    if (!progress || progress.gameState !== 'playing') {
      return res.status(400).json({ error: 'No active game' });
    }

    if (progress.lifelines[type] <= 0) {
      return res.status(400).json({ error: 'Lifeline not available' });
    }

    const question = await QuizQuestion.findById(progress.currentQuestionId);
    let result = {};

    switch(type) {
      case 'fiftyFifty':
        const wrongOptions = ['A', 'B', 'C', 'D'].filter(opt => opt !== question.correctAnswer);
        const removed = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
        result = { removedOptions: removed };
        break;
      
      case 'skip':
        const newLevel = progress.currentLevel + 1;
        result = { 
          skipped: true,
          nextLevel: newLevel > 15 ? 15 : newLevel
        };
        break;
      
      case 'askAudience':
        const hint = await aiService.askAudience(question.question, question.options);
        result = { audiencePoll: hint.response };
        break;
    }

    await QuizProgress.findByIdAndUpdate(progress._id, {
      $inc: { [`lifelines.${type}`]: -1 }
    });

    res.json(result);
  } catch (error) {
    console.error('Lifeline Error:', error);
    res.status(500).json({ error: 'Failed to use lifeline' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    
    let query = {};
    if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.completedAt = { $gte: weekAgo };
    }

    const leaderboard = await Leaderboard.find(query)
      .sort({ score: -1, completedAt: 1 })
      .limit(parseInt(limit))
      .populate('userId', 'username');

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Helper functions
function getSafeScore(level) {
  if (level >= 10) return PRIZE_LADDER[10];
  if (level >= 5) return PRIZE_LADDER[5];
  return 0;
}

async function handleGameComplete(userId, progress, finalScore, isPerfect) {
  await QuizProgress.findByIdAndUpdate(progress._id, {
    gameState: isPerfect ? 'completed' : 'failed',
    currentScore: finalScore
  });

  await Leaderboard.create({
    userId,
    username: progress.userId.username || 'Anonymous',
    score: finalScore,
    levelReached: progress.currentLevel,
    isPerfectGame: isPerfect
  });

  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalQuizzes': 1 }
  });
}

module.exports = router;
