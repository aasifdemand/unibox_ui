import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  // 🔥 Derived auth state
  get isAuthenticated() {
    return !!get().user;
  },

  // =========================
  // CHECK AUTH (SOURCE OF TRUTH)
  // =========================
  checkAuth: async () => {
    try {
      set({ loading: true });

      const res = await fetch(`${API_URL}/users/me`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const response = await res.json();

      set({
        user: response.data ?? null,
        loading: false,
      });

      return true;
    } catch {
      set({
        user: null,
        loading: false,
      });
      return false;
    }
  },

  // =========================
  // LOGIN
  // =========================
  login: async ({ email, password, rememberMe }) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      // 🔥 ALWAYS fetch user after cookie is set
      await get().checkAuth();

      return true;
    } catch (err) {
      set({
        user: null,
        loading: false,
        error: err.message,
      });
      return false;
    }
  },

  // =========================
  // SIGNUP
  // =========================
  signup: async ({ name, email, password }) => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Signup failed");
      }

      await get().checkAuth();

      return true;
    } catch (err) {
      set({
        user: null,
        loading: false,
        error: err.message,
      });
      return false;
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      set({ user: null });

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  },
}));
