const express = require('express');
const questionController = require('../controllers/questionController');
const { verifyToken, requireQuestionAuthor } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(questionController.getAllQuestions)
  .post(verifyToken, questionController.createQuestion);

router
  .route('/:questionId')
  .get(questionController.getQuestionById)
  .put(verifyToken, requireQuestionAuthor, questionController.updateQuestion)
  .delete(verifyToken, requireQuestionAuthor, questionController.deleteQuestion);

module.exports = router;
