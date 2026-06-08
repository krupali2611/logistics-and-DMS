import axiosInstance from './axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getCustomers = async (params) => {
  const response = await axiosInstance.get('/customers', { params: cleanParams(params) });
  return response.data.data;
};

export const getCustomerById = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data.data.customer;
};

export const createCustomer = async (payload) => {
  const response = await axiosInstance.post('/customers', payload);
  return response.data.data.customer;
};

export const updateCustomer = async (id, payload) => {
  const response = await axiosInstance.put(`/customers/${id}`, payload);
  return response.data.data.customer;
};

export const updateCustomerStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/customers/${id}/status`, { status });
  return response.data.data.customer;
};

export const getCustomerAddresses = async (customerId) => {
  const response = await axiosInstance.get(`/customers/${customerId}/addresses`);
  return response.data.data.addresses;
};

export const createCustomerAddress = async (customerId, payload) => {
  const response = await axiosInstance.post(`/customers/${customerId}/addresses`, payload);
  return response.data.data.address;
};

export const updateCustomerAddress = async (id, payload) => {
  const response = await axiosInstance.put(`/customer-addresses/${id}`, payload);
  return response.data.data.address;
};

export const deleteCustomerAddress = async (id) => {
  await axiosInstance.delete(`/customer-addresses/${id}`);
};

export const getCustomerDocuments = async (customerId) => {
  const response = await axiosInstance.get(`/customers/${customerId}/documents`);
  return response.data.data.documents;
};

export const createCustomerDocument = async (customerId, payload) => {
  const response = await axiosInstance.post(`/customers/${customerId}/documents`, payload);
  return response.data.data.document;
};

export const updateCustomerDocument = async (id, payload) => {
  const response = await axiosInstance.put(`/customer-documents/${id}`, payload);
  return response.data.data.document;
};

export const deleteCustomerDocument = async (id) => {
  await axiosInstance.delete(`/customer-documents/${id}`);
};

export const getCustomerNotes = async (customerId) => {
  const response = await axiosInstance.get(`/customers/${customerId}/notes`);
  return response.data.data.notes;
};

export const createCustomerNote = async (customerId, note) => {
  const response = await axiosInstance.post(`/customers/${customerId}/notes`, { note });
  return response.data.data.note;
};

export const deleteCustomerNote = async (id) => {
  await axiosInstance.delete(`/customer-notes/${id}`);
};

export const getCustomerDashboardStats = async () => {
  const response = await axiosInstance.get('/customers/dashboard/stats');
  return response.data.data.stats;
};
