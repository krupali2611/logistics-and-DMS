import axios from 'axios';
import customerAxiosInstance from './customerAxiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const registerCustomer = async (payload) => {
  const response = await publicClient.post('/customer-auth/register', payload);
  return response.data.data;
};

export const loginCustomer = async (payload) => {
  const response = await publicClient.post('/customer-auth/login', payload);
  return response.data.data;
};

export const logoutCustomer = async (refreshToken) => {
  await publicClient.post('/customer-auth/logout', { refreshToken });
};

export const requestCustomerPasswordReset = async (identifier) => {
  const response = await publicClient.post('/customer-auth/forgot-password', { identifier });
  return response.data.data;
};

export const resetCustomerPassword = async (payload) => {
  const response = await publicClient.post('/customer-auth/reset-password', payload);
  return response.data.data;
};

export const verifyCustomerOtp = async (payload) => {
  const response = await publicClient.post('/customer-auth/verify-otp', payload);
  return response.data.data;
};

export const resendCustomerOtp = async (payload) => {
  const response = await publicClient.post('/customer-auth/resend-otp', payload);
  return response.data.data;
};

export const getCustomerProfile = async () => {
  const response = await customerAxiosInstance.get('/customer/profile');
  return response.data.data;
};

export const updateCustomerProfile = async (payload) => {
  const response = await customerAxiosInstance.put('/customer/profile', payload);
  return response.data.data;
};

export const changeCustomerPassword = async (payload) => {
  const response = await customerAxiosInstance.put('/customer/change-password', payload);
  return response.data.data;
};

export const getCustomerShipmentStats = async () => {
  const response = await customerAxiosInstance.get('/customer/shipments/dashboard/stats');
  return response.data.data.stats;
};
