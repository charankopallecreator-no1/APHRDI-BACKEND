const Gamification = require('../models/Gamification');
const QuizResponse = require('../models/QuizResponse');

exports.updatePoints = async (req, res) => {
  try {
    const { points, activity } = req.body;
    const gamification = await Gamification.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { points: points } },
      { new: true, upsert: true }
    );
    
    // Check for level ups and badges
    await checkAndUpdateAchievements(gamification);
    
    res.json({ success: true, data: gamification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const checkAndUpdateAchievements = async (gamification) => {
  // Implementation of achievement and badge system
  // This is a placeholder for the actual implementation
  const currentLevel = Math.floor(gamification.points / 1000) + 1;
  if (currentLevel > gamification.level) {
    await Gamification.findByIdAndUpdate(
      gamification._id,
      { level: currentLevel }
    );
  }
};