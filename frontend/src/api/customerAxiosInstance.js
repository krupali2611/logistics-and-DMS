import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const customerAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let customerAuthStore = {
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

export const bindCustomerAuthStore = (store) => {
  customerAuthStore = store;
};

customerAxiosInstance.interceptors.request.use((config) => {
  const token = customerAuthStore.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

customerAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/customer-auth/login') &&
      !originalRequest.url?.includes('/customer-auth/refresh-token')
    ) {
      const refreshToken = customerAuthStore.getRefreshToken();

      if (!refreshToken) {
        customerAuthStore.clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return customerAxiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/customer-auth/refresh-token`, {
          refreshToken
        });
        const sessionData = response.data.data;

        customerAuthStore.updateSession(sessionData);
        flushQueue(null, sessionData.accessToken);
        originalRequest.headers.Authorization = `Bearer ${sessionData.accessToken}`;

        return customerAxiosInstance(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        customerAuthStore.clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default customerAxiosInstance;
