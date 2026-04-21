import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import quizReducer from '../features/quizSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
  },
});
