const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');

const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalQuizzes, totalQuestions, totalAttempts, quizStats] = await Promise.all([
      Quiz.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments(),
      Quiz.aggregate([
        {
          $lookup: {
            from: 'results',
            localField: '_id',
            foreignField: 'quizId',
            as: 'results',
          },
        },
        {
          $addFields: {
            completedCount: { $size: '$results' },
            avgScore: {
              $cond: [
                { $gt: [{ $size: '$results' }, 0] },
                { $avg: '$results.score' },
                0,
              ],
            },
            totalQuestions: { $size: '$questions' },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            totalQuestions: 1,
            completedCount: 1,
            avgScore: { $round: ['$avgScore', 2] },
          },
        },
        {
          $sort: {
            completedCount: -1,
            title: 1,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          totalQuizzes,
          totalQuestions,
          totalAttempts,
        },
        quizzes: quizStats,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminDashboard,
};
