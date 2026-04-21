const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const statsRoutes = require('./routes/stats');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Quiz API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
});

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([field, fieldError]) => [field, fieldError.message])
    );
    message = Object.values(details)[0] || 'Validation failed.';
  } else if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_VALUE';
    details = { [err.path]: err.message };
    message = `Invalid value for ${err.path}.`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack || err);
  }

  res.status(status).json({
    success: false,
    code,
    message,
    ...(details ? { details } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
