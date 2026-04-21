const Quiz = require('../models/Quiz');

const createHttpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const quizPopulate = {
  path: 'questions',
  select: '_id text options author',
  populate: {
    path: 'author',
    select: '_id username role',
  },
};

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);
    const populated = await quiz.populate(quizPopulate);

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().populate(quizPopulate);

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    return next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate(quizPopulate);

    if (!quiz) {
      return next(createHttpError(404, 'Quiz not found'));
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    return next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, {
      new: true,
      runValidators: true,
    }).populate(quizPopulate);

    if (!updated) {
      return next(createHttpError(404, 'Quiz not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.quizId);

    if (!deleted) {
      return next(createHttpError(404, 'Quiz not found'));
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};
