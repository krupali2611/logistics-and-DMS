const locationService = require('../services/locationService');
const ApiResponse = require('../utils/ApiResponse');

const searchLocations = async (req, res) => {
  const locations = await locationService.searchLocations({
    query: req.query.q,
    customerId: req.query.customer_id || null,
    limit: req.query.limit
  });

  return ApiResponse.success(res, 'Locations fetched successfully.', { locations });
};

const getPlaceDetails = async (req, res) => {
  const location = await locationService.getPlaceDetails({
    placeId: req.query.place_id || null,
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    customerId: req.query.customer_id || null
  });

  return ApiResponse.success(res, 'Location fetched successfully.', { location });
};

const saveAddress = async (req, res) => {
  const address = await locationService.saveCustomerAddress({
    customerId: req.body.customer_id,
    location: req.body.location,
    addressType: req.body.address_type,
    isDefault: req.body.is_default,
    isFavorite: req.body.is_favorite
  });

  return ApiResponse.success(res, 'Address saved successfully.', { address }, 201);
};

module.exports = {
  searchLocations,
  getPlaceDetails,
  saveAddress
};
