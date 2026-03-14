const mongoose = require('mongoose');

const quizProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 15
  },
  currentScore: {
    type: Number,
    default: 0
  },
  lifelines: {
    fiftyFifty: { type: Number, default: 1 },
    skip: { type: Number, default: 1 },
    askAudience: { type: Number, default: 1 }
  },
  gameState: {
    type: String,
    enum: ['idle', 'playing', 'completed', 'failed'],
    default: 'idle'
  },
  currentQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion'
  },
  questionsAnswered: [{
    questionId: mongoose.Schema.Types.ObjectId,
    correct: Boolean,
    timeTaken: Number
  }],
  lastPlayedDate: {
    type: Date,
    default: Date.now
  },
  gamesPlayedToday: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('QuizProgress', quizProgressSchema);
