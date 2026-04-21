import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getApiErrorPayload } from '../services/api';

const initialState = {
  quizzes: [],
  currentQuiz: null,
  answers: [],
  result: null,
  leaderboard: [],
  dashboard: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, thunkAPI) => {
  try {
    const response = await api.get('/quizzes');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Cannot fetch quizzes'));
  }
});

export const fetchQuizById = createAsyncThunk('quiz/fetchQuizById', async (quizId, thunkAPI) => {
  try {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Cannot fetch quiz'));
  }
});

export const submitQuizResult = createAsyncThunk('quiz/submitQuizResult', async (payload, thunkAPI) => {
  try {
    const response = await api.post('/results', payload);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Submit failed'));
  }
});

export const fetchLeaderboard = createAsyncThunk('quiz/fetchLeaderboard', async (quizId, thunkAPI) => {
  try {
    const response = await api.get(`/results/leaderboard/${quizId}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Cannot fetch leaderboard'));
  }
});

export const fetchAdminDashboard = createAsyncThunk('quiz/fetchAdminDashboard', async (_, thunkAPI) => {
  try {
    const response = await api.get('/stats/admin-dashboard');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Cannot fetch dashboard'));
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setAnswer(state, action) {
      const { questionIndex, selectedIndex } = action.payload;
      state.answers[questionIndex] = selectedIndex;
    },
    resetAnswers(state) {
      const total = state.currentQuiz?.questions?.length || 0;
      state.answers = Array(total).fill(null);
    },
    clearQuizError(state) {
      state.error = null;
    },
    clearQuizResult(state) {
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cannot fetch quizzes';
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
        state.answers = Array(action.payload.questions?.length || 0).fill(null);
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cannot fetch quiz';
      })
      .addCase(submitQuizResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitQuizResult.fulfilled, (state, action) => {
        state.submitting = false;
        state.result = action.payload;
      })
      .addCase(submitQuizResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Submit failed';
      })
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.leaderboard = [];
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cannot fetch leaderboard';
      })
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cannot fetch dashboard';
      });
  },
});

export const { setAnswer, resetAnswers, clearQuizError, clearQuizResult } = quizSlice.actions;
export default quizSlice.reducer;
