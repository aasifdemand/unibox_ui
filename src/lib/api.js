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

export const apiClient = async (endpoint, options = {}) => {
  const { headers, ...rest } = options;

  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

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
      return fetch(`${API_URL}${endpoint}`, defaultOptions);
    }

    // Both access-token request AND refresh-token failed → session is truly expired.
    // Fire a DOM event so the SessionExpiredModal can show a user-friendly popup.
    console.warn('[API] Session definitively expired. Dispatching popup event.');
    dispatchSessionExpired();

    // Still return the 401 so callers can handle it if they choose
    return response;
  }

  return response;
};

// Helper for common methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => 
    apiClient(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  patch: (endpoint, data, options) => 
    apiClient(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  put: (endpoint, data, options) => 
    apiClient(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};
