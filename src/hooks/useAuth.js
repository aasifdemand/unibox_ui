// hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

// Query keys
export const authKeys = {
  all: ["auth"],
  user: () => [...authKeys.all, "user"],
};

// =========================
// CHECK AUTH QUERY
// =========================
const fetchCurrentUser = async () => {
  const res = await fetch(`${API_URL}/users/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      return null; // Not authenticated is not an error
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch user");
  }

  const response = await res.json();
  return response.data ?? null;
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

// =========================
// LOGIN MUTATION
// =========================
const loginUser = async ({ email, password, rememberMe }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// =========================
// SIGNUP MUTATION
// =========================
const signupUser = async ({ name, email, password }) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// =========================
// LOGOUT MUTATION
// =========================
const logoutUser = async () => {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Logout failed");
  }

  return true;
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
    },
    onError: () => {
      // Still clear local state even if server logout fails
      queryClient.clear();
    },
  });
};

// =========================
// FORGOT PASSWORD MUTATION
// =========================
const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send reset email");
  }

  return data;
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

// =========================
// RESET PASSWORD MUTATION
// =========================
const resetPassword = async ({ email, otp, newPassword }) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};

// =========================
// CHANGE PASSWORD MUTATION
// =========================
const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await fetch(`${API_URL}/users/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to change password");
  }

  return data;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

// =========================
// UPDATE PROFILE MUTATION
// =========================
const updateProfile = async (userData) => {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), updatedUser);
    },
  });
};

// =========================
// REFRESH TOKEN MUTATION
// =========================
const refreshToken = async () => {
  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to refresh token");
  }

  return data;
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: () => {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// =========================
// OAUTH CALLBACK HANDLER
// =========================
export const useOAuthCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ provider, code, state }) => {
      const res = await fetch(`${API_URL}/auth/${provider}/callback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OAuth authentication failed");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};
