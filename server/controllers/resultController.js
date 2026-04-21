const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const createHttpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getQuizLeaderboardPipeline = (quizObjectId) => [
  {
    $match: { quizId: quizObjectId },
  },
  {
    $group: {
      _id: '$userId',
      bestScore: { $max: '$score' },
      totalQuestions: { $max: '$totalQuestions' },
      attempts: { $sum: 1 },
      latestCompletedAt: { $max: '$completedAt' },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: '$user' },
  {
    $project: {
      _id: 0,
      userId: '$user._id',
      username: '$user.username',
      bestScore: 1,
      totalQuestions: 1,
      attempts: 1,
      latestCompletedAt: 1,
    },
  },
  {
    $sort: {
      bestScore: -1,
      latestCompletedAt: -1,
    },
  },
  { $limit: 10 },
];

const getGlobalLeaderboardPipeline = () => [
  {
    $group: {
      _id: '$userId',
      totalScore: { $sum: '$score' },
      totalPossibleScore: { $sum: '$totalQuestions' },
      bestScore: { $max: '$score' },
      attempts: { $sum: 1 },
      quizzesPlayed: { $addToSet: '$quizId' },
      latestCompletedAt: { $max: '$completedAt' },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: '$user' },
  {
    $project: {
      _id: 0,
      userId: '$user._id',
      username: '$user.username',
      totalScore: 1,
      totalPossibleScore: 1,
      bestScore: 1,
      attempts: 1,
      quizzesPlayed: { $size: '$quizzesPlayed' },
      latestCompletedAt: 1,
    },
  },
  {
    $sort: {
      totalScore: -1,
      bestScore: -1,
      latestCompletedAt: -1,
    },
  },
  { $limit: 10 },
];

const submitResult = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !Array.isArray(answers)) {
      return next(createHttpError(400, 'quizId and answers are required'));
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return next(createHttpError(400, 'Invalid quizId'));
    }

    const quiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      select: '_id correctAnswerIndex',
    });

    if (!quiz) {
      return next(createHttpError(404, 'Quiz not found'));
    }

    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return next(createHttpError(400, 'Quiz has no questions'));
    }

    if (answers.length !== totalQuestions) {
      return next(createHttpError(400, 'You must answer all questions before submitting'));
    }

    const answerMap = new Map();
    for (const answer of answers) {
      if (!answer.questionId || typeof answer.selectedIndex !== 'number') {
        return next(createHttpError(400, 'Each answer must include questionId and selectedIndex'));
      }
      answerMap.set(String(answer.questionId), answer.selectedIndex);
    }

    if (answerMap.size !== totalQuestions) {
      return next(createHttpError(400, 'Answers contain duplicate or missing question IDs'));
    }

    let score = 0;
    for (const question of quiz.questions) {
      const selectedIndex = answerMap.get(String(question._id));
      if (typeof selectedIndex !== 'number') {
        return next(createHttpError(400, 'You must answer all questions before submitting'));
      }
      if (selectedIndex === question.correctAnswerIndex) {
        score += 1;
      }
    }

    const result = await Result.create({
      userId: req.user.id,
      quizId,
      score,
      totalQuestions,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        _id: result._id,
        userId: result.userId,
        quizId: result.quizId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getLeaderboardByQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    if (quizId !== 'ALL' && !mongoose.Types.ObjectId.isValid(quizId)) {
      return next(createHttpError(400, 'Invalid quizId'));
    }

    const leaderboard = await Result.aggregate(
      quizId === 'ALL'
        ? getGlobalLeaderboardPipeline()
        : getQuizLeaderboardPipeline(new mongoose.Types.ObjectId(quizId))
    );

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitResult,
  getLeaderboardByQuiz,
};
