const checkSubscription = async (req, res, next) => {
  const user = req.user;
  
  // Reset daily usage if needed
  if (user.resetDailyUsage()) {
    await user.save();
  }

  const isPremium = user.subscription.plan !== 'free' && 
                    user.subscription.status === 'active' &&
                    new Date(user.subscription.endDate) > new Date();

  req.isPremium = isPremium;
  req.userLimits = {
    aiQuestions: isPremium ? Infinity : parseInt(process.env.FREE_AI_DAILY_LIMIT),
    imageSolves: isPremium ? Infinity : parseInt(process.env.FREE_IMAGE_DAILY_LIMIT),
    quizGames: isPremium ? Infinity : parseInt(process.env.FREE_QUIZ_DAILY_LIMIT)
  };

  next();
};

module.exports = checkSubscription;
