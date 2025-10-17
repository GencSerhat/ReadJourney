import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";

const PERSIST_KEY = "auth";


function loadState() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    const data = JSON.parse(raw);
    return {
      auth: {
        user: data?.user ?? null,
        token: data?.token ?? null,
        status: "idle",
        error: null,
      },
    };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
});


store.subscribe(() => {
  try {
    const state = store.getState();
    const { user, token } = state.auth || {};
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ user, token }));
  } catch {
   
  }
});
