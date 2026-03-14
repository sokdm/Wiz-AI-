const mongoose = require('mongoose');

const aiUsageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['homework', 'tutor', 'image', 'quiz_hint'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: String,
  tokensUsed: {
    type: Number,
    default: 0
  },
  processingTime: Number,
  cached: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AiUsageLog', aiUsageLogSchema);
