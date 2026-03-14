const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    transactionId: String
  },
  dailyUsage: {
    aiQuestions: { type: Number, default: 0 },
    imageSolves: { type: Number, default: 0 },
    quizGames: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  stats: {
    totalAiQuestions: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    totalImages: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    lastStudyDate: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.resetDailyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.dailyUsage.lastReset);
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
    this.dailyUsage.aiQuestions = 0;
    this.dailyUsage.imageSolves = 0;
    this.dailyUsage.quizGames = 0;
    this.dailyUsage.lastReset = now;
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
