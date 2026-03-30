/**
 * A global API client wrapper for fetch to handle session expiration (autologout)
 */

const API_URL = import.meta.env.VITE_API_URL;
let refreshingPromise = null;

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
  ];
  return authEndpoints.some((auth) => endpoint.startsWith(auth));
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

    const refreshRes = await refreshingPromise;

    if (refreshRes.ok) {
      // Refresh succeeded, retry original request
      return fetch(`${API_URL}${endpoint}`, defaultOptions);
    }
    
    // Refresh failed, return original 401
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
