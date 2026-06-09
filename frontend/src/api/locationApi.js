import axiosInstance from './axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const searchLocations = async (params) => {
  const response = await axiosInstance.get('/locations/search', {
    params: cleanParams(params)
  });
  return response.data.data.locations;
};

export const getLocationPlaceDetails = async (params) => {
  const response = await axiosInstance.get('/locations/place-details', {
    params: cleanParams(params)
  });
  return response.data.data.location;
};

export const saveLocationAddress = async (payload) => {
  const response = await axiosInstance.post('/locations/save-address', payload);
  return response.data.data.address;
};
