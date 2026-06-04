import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authStore = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  updateSession: () => {},
  clearSession: () => {}
};

let isRefreshing = false;
let refreshQueue = [];

const flushQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

export const bindAuthStore = (store) => {
  authStore = store;
};

axiosInstance.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = authStore.getRefreshToken();

      if (!refreshToken) {
        authStore.clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const sessionData = response.data.data;

        authStore.updateSession(sessionData);
        flushQueue(null, sessionData.accessToken);
        originalRequest.headers.Authorization = `Bearer ${sessionData.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        authStore.clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
