import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Determine if accessing from a local/LAN network
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.');

    if (isLocal) {
      return `http://${hostname}:3000/api/v1`;
    } else {
      // Production Cloudflare Tunnel environment (e.g., nabz.asia) over HTTPS without port 3000
      return `${protocol}//${hostname}/api/v1`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
};

const API_URL = getDynamicApiUrl();

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nabz_access_token');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nabz_refresh_token');
  }
  return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nabz_access_token', accessToken);
    localStorage.setItem('nabz_refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nabz_access_token');
    localStorage.removeItem('nabz_refresh_token');
    localStorage.removeItem('nabz_user');
  }
};

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT access token and dynamically set base URL
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dynamically align Axios requests depending on environment (local vs. production domain)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.');

      if (isLocal) {
        config.baseURL = `http://${hostname}:3000/api/v1`;
      } else {
        config.baseURL = `${protocol}//${hostname}/api/v1`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to avoid infinite loops during refresh token retries
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Handle response interceptor for token refresh
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already a retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid loops
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const rToken = getRefreshToken();
      if (!rToken) {
        clearTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data: responseBody } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: rToken,
        });

        const newAccessToken = responseBody.data?.accessToken;
        const newRefreshToken = responseBody.data?.refreshToken;

        if (newAccessToken && newRefreshToken) {
          setTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return client(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          // Trigger logout redirect event
          window.dispatchEvent(new Event('nabz_logout'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
