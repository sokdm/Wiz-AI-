const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  levelReached: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  isPerfectGame: {
    type: Boolean,
    default: false
  }
});

leaderboardSchema.index({ score: -1, completedAt: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
