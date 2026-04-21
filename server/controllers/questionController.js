const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

const createHttpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
};

const resolveQuestionPayload = (body = {}, fallback = {}) => {
  const source = body && typeof body === 'object' ? body : {};

  const text = typeof source.text === 'string' ? source.text.trim() : fallback.text;
  const options = source.options !== undefined ? normalizeStringArray(source.options) : fallback.options;
  const keywords =
    source.keywords !== undefined ? normalizeStringArray(source.keywords) : fallback.keywords || [];

  let correctAnswerIndex = fallback.correctAnswerIndex;
  if (source.correctAnswerIndex !== undefined) {
    correctAnswerIndex = Number(source.correctAnswerIndex);
  }

  if (!text) {
    return nextValidationError('Question text is required.', { text: 'Question text is required.' });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return nextValidationError('Please enter at least 2 valid answer options.', {
      options: 'Please enter at least 2 valid answer options.',
    });
  }

  if (!Number.isInteger(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
    return nextValidationError('Correct answer must match one of the answer options.', {
      correctAnswerIndex: 'Correct answer must match one of the answer options.',
    });
  }

  return {
    text,
    options,
    correctAnswerIndex,
    keywords,
  };
};

const nextValidationError = (message, details) => {
  const err = createHttpError(400, message);
  err.code = 'VALIDATION_ERROR';
  err.details = details;
  return err;
};

const createQuestion = async (req, res, next) => {
  try {
    const payload = resolveQuestionPayload(req.body);
    if (payload instanceof Error) {
      return next(payload);
    }

    const question = await Question.create({
      ...payload,
      author: req.user.id,
    });

    const populated = await question.populate('author', '_id username role');

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().populate('author', '_id username role');

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return next(error);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId).populate('author', '_id username role');

    if (!question) {
      return next(createHttpError(404, 'Question not found'));
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    return next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(createHttpError(404, 'Question not found'));
    }

    const payload = resolveQuestionPayload(req.body, {
      text: question.text,
      options: question.options,
      correctAnswerIndex: question.correctAnswerIndex,
      keywords: question.keywords,
    });

    if (payload instanceof Error) {
      return next(payload);
    }

    Object.assign(question, payload);
    await question.save();

    const updated = await question.populate('author', '_id username role');

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.questionId);

    if (!deleted) {
      return next(createHttpError(404, 'Question not found'));
    }

    await Quiz.updateMany({ questions: deleted._id }, { $pull: { questions: deleted._id } });

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
