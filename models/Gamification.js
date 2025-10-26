const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    earnedAt: Date
  }],
  level: {
    type: Number,
    default: 1
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gamification', gamificationSchema);