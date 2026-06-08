import axiosInstance from './axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getPricingRules = async (params) => {
  const response = await axiosInstance.get('/pricing', { params: cleanParams(params) });
  return response.data.data.pricingRules;
};

export const getPricingRuleById = async (id) => {
  const response = await axiosInstance.get(`/pricing/${id}`);
  return response.data.data.pricingRule;
};

export const createPricingRule = async (payload) => {
  const response = await axiosInstance.post('/pricing', payload);
  return response.data.data.pricingRule;
};

export const updatePricingRule = async (id, payload) => {
  const response = await axiosInstance.put(`/pricing/${id}`, payload);
  return response.data.data.pricingRule;
};

export const deletePricingRule = async (id) => {
  await axiosInstance.delete(`/pricing/${id}`);
};

export const estimateShipmentFare = async (payload) => {
  const response = await axiosInstance.post('/pricing/estimate', payload);
  return response.data.data.estimation;
};
