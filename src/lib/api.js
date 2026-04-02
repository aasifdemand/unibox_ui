/**
 * A global API client wrapper for fetch to handle session expiration (autologout)
 */

import { SESSION_EXPIRED_EVENT } from './session-events';

const API_URL = import.meta.env.VITE_API_URL;
let refreshingPromise = null;

// Prevent firing the session-expired event multiple times in the same session
let sessionExpiredFired = false;

const isAuthRequest = (endpoint) => {
  const authEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/google',
    '/auth/linkedin',
    '/auth/refresh-token',
    '/auth/verify-account',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/logout',
  ];
  return authEndpoints.some((auth) => endpoint.startsWith(auth));
};

const dispatchSessionExpired = () => {
  if (sessionExpiredFired) return;
  sessionExpiredFired = true;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async (endpoint, options = {}) => {
  const { headers, ...rest } = options;

  const defaultOptions = {
    credentials: 'include',
    headers: {
      ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...rest,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, defaultOptions);
  } catch (err) {
    console.error('[API] Network error:', err);
    throw new ApiError('Network error. Please check your connection.', 0);
  }

  // Handle 401 Unauthorized (except for auth requests)
  if (response.status === 401 && !isAuthRequest(endpoint)) {
    // Session might be expired, try to refresh
    if (!refreshingPromise) {
      refreshingPromise = fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      }).finally(() => {
        refreshingPromise = null;
      });
    }

    let refreshRes;
    try {
      refreshRes = await refreshingPromise;
    } catch (err) {
      console.error('[API] Refresh token request failed:', err);
    }

    if (refreshRes && refreshRes.ok) {
      // Refresh succeeded, retry original request
      const retryResponse = await fetch(`${API_URL}${endpoint}`, defaultOptions);
      if (retryResponse.ok) return retryResponse;
      
      // If retry failed, throw error
      const errorData = await retryResponse.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Request failed after refresh', retryResponse.status, errorData);
    }

    // Both access-token request AND refresh-token failed → session is truly expired.
    console.warn('[API] Session definitively expired. Dispatching popup event.');
    dispatchSessionExpired();
    
    throw new ApiError('Session expired. Please login again.', 401);
  }

  // Throw error for any non-2xx response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response;
};

// Helper for common methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  patch: (endpoint, data, options) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  put: (endpoint, data, options) => 
    apiClient(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};
