import axiosInstance from './axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getVehicleTypes = async (params) => {
  const response = await axiosInstance.get('/vehicle-types', { params: cleanParams(params) });
  return response.data.data.vehicleTypes;
};

export const getVehicleTypeById = async (id) => {
  const response = await axiosInstance.get(`/vehicle-types/${id}`);
  return response.data.data.vehicleType;
};

export const createVehicleType = async (payload) => {
  const response = await axiosInstance.post('/vehicle-types', payload);
  return response.data.data.vehicleType;
};

export const updateVehicleType = async (id, payload) => {
  const response = await axiosInstance.put(`/vehicle-types/${id}`, payload);
  return response.data.data.vehicleType;
};

export const deleteVehicleType = async (id) => {
  await axiosInstance.delete(`/vehicle-types/${id}`);
};

export const getVehicles = async (params) => {
  const response = await axiosInstance.get('/vehicles', { params: cleanParams(params) });
  return response.data.data;
};

export const getVehicleById = async (id) => {
  const response = await axiosInstance.get(`/vehicles/${id}`);
  return response.data.data.vehicle;
};

export const createVehicle = async (payload) => {
  const response = await axiosInstance.post('/vehicles', payload);
  return response.data.data.vehicle;
};

export const updateVehicle = async (id, payload) => {
  const response = await axiosInstance.put(`/vehicles/${id}`, payload);
  return response.data.data.vehicle;
};

export const deleteVehicle = async (id) => {
  await axiosInstance.delete(`/vehicles/${id}`);
};

export const updateVehicleStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/vehicles/${id}/status`, { status });
  return response.data.data.vehicle;
};

export const verifyVehicle = async (id, verification_status) => {
  const response = await axiosInstance.patch(`/vehicles/${id}/verify`, {
    verification_status
  });
  return response.data.data.vehicle;
};

export const updateVehicleAvailability = async (id, availability_status) => {
  const response = await axiosInstance.patch(`/vehicles/${id}/availability`, {
    availability_status
  });
  return response.data.data.vehicle;
};

export const getVehicleDocuments = async (vehicleId) => {
  const response = await axiosInstance.get(`/vehicles/${vehicleId}/documents`);
  return response.data.data.documents;
};

export const createVehicleDocument = async (vehicleId, payload) => {
  const response = await axiosInstance.post(`/vehicles/${vehicleId}/documents`, payload);
  return response.data.data.document;
};

export const updateVehicleDocument = async (id, payload) => {
  const response = await axiosInstance.put(`/vehicle-documents/${id}`, payload);
  return response.data.data.document;
};

export const deleteVehicleDocument = async (id) => {
  await axiosInstance.delete(`/vehicle-documents/${id}`);
};

export const getVehicleAssignments = async (params) => {
  const response = await axiosInstance.get('/vehicle-assignments', {
    params: cleanParams(params)
  });
  return response.data.data;
};

export const assignVehicle = async (payload) => {
  const response = await axiosInstance.post('/vehicle-assignments', payload);
  return response.data.data.assignment;
};

export const removeVehicleAssignment = async (id) => {
  await axiosInstance.delete(`/vehicle-assignments/${id}`);
};

export const getVehicleDashboardStats = async () => {
  const response = await axiosInstance.get('/vehicles/dashboard/stats');
  return response.data.data.stats;
};
