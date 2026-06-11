import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../models';

interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  role: localStorage.getItem('userRole'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: User }>) {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.user.roleName;
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('userRole', action.payload.user.roleName);
      localStorage.setItem('userName', action.payload.user.userName);
      localStorage.setItem('userId', action.payload.user.userId.toString());
      localStorage.setItem('mobileNo', action.payload.user.mobileNo);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      localStorage.clear();
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
