import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Query keys
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
};

// =========================
// CHECK AUTH QUERY
// =========================
const fetchCurrentUser = async ({ signal }) => {
  try {
    const res = await apiClient('/users/me', { signal });
    const response = await res.json();
    return response.data ?? null;
  } catch (err) {
    // If 401, user is just not logged in - return null
    if (err.status === 401) return null;
    throw err;
  }
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
};

// =========================
// LOGIN MUTATION
// =========================
const loginUser = async ({ email, password, rememberMe }) => {
  const res = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe }),
  });

  return await res.json();
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// =========================
// SIGNUP MUTATION
// =========================
const signupUser = async ({ name, email, password }) => {
  const res = await apiClient('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  return await res.json();
};

export const useSignup = () => {
  return useMutation({
    mutationFn: signupUser,
  });
};

// =========================
// VERIFY ACCOUNT MUTATION
// =========================
const verifyAccount = async ({ email, otp }) => {
  const res = await apiClient('/auth/verify-account', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

  return await res.json();
};

export const useVerifyAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// =========================
// RESEND VERIFICATION MUTATION
// =========================
const resendVerification = async ({ email }) => {
  const res = await apiClient('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to resend verification code');
  }

  return data;
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: resendVerification,
  });
};

// =========================
// LOGOUT MUTATION
// =========================
const logoutUser = async () => {
  const res = await apiClient('/auth/logout', {
    method: 'POST',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Logout failed');
  }

  return true;
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/auth/login';
    },
    onError: () => {
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });
};

// =========================
// FORGOT PASSWORD MUTATION
// =========================
const forgotPassword = async ({ email }) => {
  const res = await apiClient('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to send reset email');
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
const resetPassword = async ({ token, newPassword }) => {
  const res = await apiClient('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to reset password');
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
  const res = await apiClient('/users/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to change password');
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
  const res = await apiClient('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.user(), (old) => ({
        ...old,
        ...updatedUser,
      }));
    },
  });
};

// =========================
// REFRESH TOKEN MUTATION
// =========================
const refreshToken = async () => {
  const res = await apiClient('/auth/refresh-token', {
    method: 'POST',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Failed to refresh token');
  }

  return data;
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: () => {
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
      const res = await apiClient(`/auth/${provider}/callback`, {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OAuth authentication failed');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

