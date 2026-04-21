const express = require('express');
const quizController = require('../controllers/quizController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(quizController.getAllQuizzes)
  .post(verifyToken, requireAdmin, quizController.createQuiz);

router
  .route('/:quizId')
  .get(quizController.getQuizById)
  .put(verifyToken, requireAdmin, quizController.updateQuiz)
  .delete(verifyToken, requireAdmin, quizController.deleteQuiz);

module.exports = router;
