const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length >= 2 &&
            value.every((item) => typeof item === 'string' && item.trim().length > 0)
          );
        },
        message: 'Please enter at least 2 valid answer options.',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value) && Array.isArray(this.options) && value >= 0 && value < this.options.length;
        },
        message: 'Correct answer must match one of the answer options.',
      },
    },
    keywords: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
        },
        message: 'Keywords must be valid text values.',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
