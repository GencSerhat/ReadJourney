import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,        // {name, email, ...}
  token: null,       // string
  status: "idle",    // "idle" | "loading" | "succeeded" | "failed"
  error: null,       // string | null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload || {};
      state.user = user ?? null;
      state.token = token ?? null;
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    },
    setAuthStatus(state, action) {
      state.status = action.payload || "idle";
    },
    setAuthError(state, action) {
      state.error = action.payload || null;
    },
  },
});

export const { setCredentials, clearAuth, setAuthStatus, setAuthError } =
  authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
