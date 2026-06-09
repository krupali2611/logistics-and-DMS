import axiosInstance from './axiosInstance';
import customerAxiosInstance from './customerAxiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

const ADMIN_AUTH_STORAGE_KEY = 'logistics_dms_auth';
const CUSTOMER_AUTH_STORAGE_KEY = 'logistics_dms_customer_auth';

const getShipmentApiContext = () => {
  if (typeof window === 'undefined') {
    return {
      client: axiosInstance,
      basePath: '/shipments'
    };
  }

  const pathname = window.location.pathname || '';
  const hasAdminSession = Boolean(window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY));
  const hasCustomerSession = Boolean(window.localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY));
  const useCustomerApi =
    pathname.startsWith('/customer') || (!hasAdminSession && hasCustomerSession);

  return useCustomerApi
    ? {
        client: customerAxiosInstance,
        basePath: '/customer/shipments'
      }
    : {
        client: axiosInstance,
        basePath: '/shipments'
      };
};

export const getShipments = async (params) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.get(basePath, { params: cleanParams(params) });
  return response.data.data;
};

export const getShipmentById = async (id) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.get(`${basePath}/${id}`);
  return response.data.data.shipment;
};

export const createShipment = async (payload) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.post(basePath, payload);
  return response.data.data.shipment;
};

export const previewShipmentRoute = async (payload) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.post(`${basePath}/route-preview`, payload);
  return response.data.data.route;
};

export const updateShipment = async (id, payload) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.put(`${basePath}/${id}`, payload);
  return response.data.data.shipment;
};

export const cancelShipment = async (id, cancellation_reason) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.patch(`${basePath}/${id}/cancel`, { cancellation_reason });
  return response.data.data.shipment;
};

export const updateShipmentStatus = async (id, status, remarks) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.patch(`${basePath}/${id}/status`, { status, remarks });
  return response.data.data.shipment;
};

export const getShipmentPackages = async (shipmentId) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.get(`${basePath}/${shipmentId}/packages`);
  return response.data.data.packages;
};

export const createShipmentPackages = async (shipmentId, payload) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.post(`${basePath}/${shipmentId}/packages`, payload);
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
  const { client, basePath } = getShipmentApiContext();
  const response = await client.get(`${basePath}/${shipmentId}/attachments`);
  return response.data.data.attachments;
};

export const createShipmentAttachment = async (shipmentId, payload) => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.post(`${basePath}/${shipmentId}/attachments`, payload);
  return response.data.data.attachment;
};

export const deleteShipmentAttachment = async (id) => {
  await axiosInstance.delete(`/attachments/${id}`);
};

export const getShipmentDashboardStats = async () => {
  const { client, basePath } = getShipmentApiContext();
  const response = await client.get(`${basePath}/dashboard/stats`);
  return response.data.data.stats;
};
