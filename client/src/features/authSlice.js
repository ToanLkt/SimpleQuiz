import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getApiErrorPayload } from '../services/api';

const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
const parsedUser = (() => {
  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
})();

const initialState = {
  token: token || null,
  user: parsedUser,
  isLoggedIn: Boolean(token),
  loading: false,
  error: null,
};

const persistAuth = (newToken, user) => {
  if (newToken) {
    localStorage.setItem('token', newToken);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

const clearPersistedAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const resetAuthState = (state) => {
  state.user = null;
  state.token = null;
  state.isLoggedIn = false;
  clearPersistedAuth();
};

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Register failed'));
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Login failed'));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorPayload(error, 'Cannot fetch profile'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      resetAuthState(state);
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Register failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.isLoggedIn = true;
        persistAuth(action.payload.token, action.payload.data);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = Boolean(state.token);
        persistAuth(state.token, action.payload);
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Cannot fetch profile';

        if (action.payload?.status === 401) {
          resetAuthState(state);
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
