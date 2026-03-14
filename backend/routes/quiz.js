const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const QuizProgress = require('../models/QuizProgress');
const Leaderboard = require('../models/Leaderboard');
const quizAiService = require('../services/quizAiService');
const User = require('../models/User');

const PRIZE_LADDER = [0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];

// Store current game questions in memory (or use Redis in production)
const gameQuestions = new Map();

// Start new game
router.get('/start', auth, checkSubscription, async (req, res) => {
  try {
    console.log('Quiz start requested by:', req.user._id);

    // Check daily limit for free users
    if (!req.isPremium) {
      const progress = await QuizProgress.findOne({ userId: req.user._id });
      
      if (progress && progress.gamesPlayedToday >= req.userLimits.quizGames) {
        return res.status(403).json({
          error: 'Daily quiz limit reached. Upgrade to Premium for unlimited games.',
          upgrade: true
        });
      }
    }

    // Generate first question using AI
    const question = await quizAiService.generateQuestion(1);
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store question temporarily
    gameQuestions.set(`${req.user._id}_${questionId}`, {
      ...question,
      id: questionId
    });

    // Reset or create progress
    await QuizProgress.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
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
          currentQuestionId: questionId
        },
        $inc: { gamesPlayedToday: 1 }
      },
      { upsert: true, new: true }
    );

    console.log('Game started with AI-generated question');

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
        id: questionId,
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

    // Generate new question using AI
    const question = await quizAiService.generateQuestion(level);
    const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    gameQuestions.set(`${req.user._id}_${questionId}`, {
      ...question,
      id: questionId
    });

    await QuizProgress.findByIdAndUpdate(progress._id, {
      currentQuestionId: questionId
    });

    res.json({
      id: questionId,
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

    // Get question from memory
    const questionKey = `${req.user._id}_${questionId}`;
    const question = gameQuestions.get(questionKey);
    
    if (!question) {
      return res.status(404).json({ error: 'Question expired. Please start a new game.' });
    }

    const isCorrect = question.correctAnswer === answer;
    
    // Clean up used question
    gameQuestions.delete(questionKey);
    
    if (isCorrect) {
      const newLevel = progress.currentLevel + 1;
      const newScore = PRIZE_LADDER[newLevel - 1] || progress.currentScore;
      
      if (newLevel > 15) {
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

    const questionKey = `${req.user._id}_${progress.currentQuestionId}`;
    const question = gameQuestions.get(questionKey);
    
    if (!question) {
      return res.status(404).json({ error: 'Question expired' });
    }

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
        const poll = await quizAiService.generateAudiencePoll(
          question.question,
          question.options,
          question.correctAnswer
        );
        result = { audiencePoll: poll };
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
      .limit(parseInt(limit));

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
    username: 'Anonymous',
    score: finalScore,
    levelReached: progress.currentLevel,
    isPerfectGame: isPerfect
  });

  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalQuizzes': 1 }
  });
}

module.exports = router;
