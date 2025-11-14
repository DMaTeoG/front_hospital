import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;
let refreshPromise: Promise<string | null> | null = null;

type RetryableConfig = InternalAxiosRequestConfig & { _isRetry?: boolean };

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const registerRefreshHandler = (
  handler: (() => Promise<string | null>) | null,
) => {
  refreshHandler = handler;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = (error.config ?? {}) as RetryableConfig;

    if (
      status === 401 &&
      !originalRequest._isRetry &&
      refreshHandler
    ) {
      try {
        if (!refreshPromise) {
          refreshPromise = refreshHandler().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;

        if (newToken) {
          originalRequest._isRetry = true;
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // intentionally swallow and allow rejection below
      }
    }

    return Promise.reject(error);
  },
);
