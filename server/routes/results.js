const express = require('express');
const resultController = require('../controllers/resultController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, resultController.submitResult);
router.get('/leaderboard/:quizId', resultController.getLeaderboardByQuiz);

module.exports = router;
