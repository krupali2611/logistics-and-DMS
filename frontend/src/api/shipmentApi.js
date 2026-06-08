import axiosInstance from './axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getShipments = async (params) => {
  const response = await axiosInstance.get('/shipments', { params: cleanParams(params) });
  return response.data.data;
};

export const getShipmentById = async (id) => {
  const response = await axiosInstance.get(`/shipments/${id}`);
  return response.data.data.shipment;
};

export const createShipment = async (payload) => {
  const response = await axiosInstance.post('/shipments', payload);
  return response.data.data.shipment;
};

export const updateShipment = async (id, payload) => {
  const response = await axiosInstance.put(`/shipments/${id}`, payload);
  return response.data.data.shipment;
};

export const deleteShipment = async (id) => {
  await axiosInstance.delete(`/shipments/${id}`);
};

export const cancelShipment = async (id, remarks) => {
  const response = await axiosInstance.patch(`/shipments/${id}/cancel`, { remarks });
  return response.data.data.shipment;
};

export const updateShipmentStatus = async (id, status, remarks) => {
  const response = await axiosInstance.patch(`/shipments/${id}/status`, { status, remarks });
  return response.data.data.shipment;
};

export const getShipmentPackages = async (shipmentId) => {
  const response = await axiosInstance.get(`/shipments/${shipmentId}/packages`);
  return response.data.data.packages;
};

export const createShipmentPackages = async (shipmentId, payload) => {
  const response = await axiosInstance.post(`/shipments/${shipmentId}/packages`, payload);
  return response.data.data.packages;
};

export const updateShipmentPackage = async (id, payload) => {
  const response = await axiosInstance.put(`/packages/${id}`, payload);
  return response.data.data.shipmentPackage;
};

export const deleteShipmentPackage = async (id) => {
  await axiosInstance.delete(`/packages/${id}`);
};

export const getShipmentAttachments = async (shipmentId) => {
  const response = await axiosInstance.get(`/shipments/${shipmentId}/attachments`);
  return response.data.data.attachments;
};

export const createShipmentAttachment = async (shipmentId, payload) => {
  const response = await axiosInstance.post(`/shipments/${shipmentId}/attachments`, payload);
  return response.data.data.attachment;
};

export const deleteShipmentAttachment = async (id) => {
  await axiosInstance.delete(`/attachments/${id}`);
};

export const getShipmentDashboardStats = async () => {
  const response = await axiosInstance.get('/shipments/dashboard/stats');
  return response.data.data.stats;
};
