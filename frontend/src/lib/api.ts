import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token conditionally if valid token is stored in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
  }
  return config;
});

// Exportable token refresh helper
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') return null;

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );

    const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
    if (newAccessToken && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return null;
  }
}

// Handle automatic token refresh on 401 without disrupting public user navigation
api.interceptors.response.use(
  (response) => {
    // Return extracted data if wrapped in standard ApiResponse envelope
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    const status = error.response?.status;
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'An unexpected error occurred';
    const formattedError: any = new Error(Array.isArray(message) ? message.join(', ') : message);
    formattedError.status = status;
    formattedError.response = error.response;
    return Promise.reject(formattedError);
  },
);
