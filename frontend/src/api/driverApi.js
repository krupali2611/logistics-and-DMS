import axiosInstance from './axiosInstance';

export const getDrivers = async (params) => {
  const response = await axiosInstance.get('/drivers', { params });
  return response.data.data;
};

export const getDriverById = async (id) => {
  const response = await axiosInstance.get(`/drivers/${id}`);
  return response.data.data.driver;
};

export const createDriver = async (payload) => {
  const response = await axiosInstance.post('/drivers', payload);
  return response.data.data.driver;
};

export const updateDriver = async (id, payload) => {
  const response = await axiosInstance.put(`/drivers/${id}`, payload);
  return response.data.data.driver;
};

export const deleteDriver = async (id) => {
  await axiosInstance.delete(`/drivers/${id}`);
};

export const updateDriverStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/drivers/${id}/status`, { status });
  return response.data.data.driver;
};

export const updateDriverAvailability = async (id, availability_status) => {
  const response = await axiosInstance.patch(`/drivers/${id}/availability`, {
    availability_status
  });
  return response.data.data.driver;
};

export const verifyDriver = async (id, verification_status) => {
  const response = await axiosInstance.patch(`/drivers/${id}/verify`, {
    verification_status
  });
  return response.data.data.driver;
};

export const getDriverDocuments = async (driverId) => {
  const response = await axiosInstance.get(`/drivers/${driverId}/documents`);
  return response.data.data.documents;
};

export const createDriverDocument = async (driverId, payload) => {
  const response = await axiosInstance.post(`/drivers/${driverId}/documents`, payload);
  return response.data.data.document;
};

export const updateDriverDocument = async (id, payload) => {
  const response = await axiosInstance.put(`/documents/${id}`, payload);
  return response.data.data.document;
};

export const deleteDriverDocument = async (id) => {
  await axiosInstance.delete(`/documents/${id}`);
};

export const getDriverDashboardStats = async () => {
  const response = await axiosInstance.get('/drivers/dashboard/stats');
  return response.data.data.stats;
};
