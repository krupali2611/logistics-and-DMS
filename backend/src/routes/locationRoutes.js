const express = require('express');
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  searchLocationsValidator,
  getPlaceDetailsValidator,
  saveLocationValidator
} = require('../validators/locationValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/search',
  searchLocationsValidator,
  validationMiddleware,
  asyncHandler(locationController.searchLocations)
);

router.get(
  '/place-details',
  getPlaceDetailsValidator,
  validationMiddleware,
  asyncHandler(locationController.getPlaceDetails)
);

router.post(
  '/save-address',
  permissionMiddleware('customer_update'),
  saveLocationValidator,
  validationMiddleware,
  asyncHandler(locationController.saveAddress)
);

module.exports = router;
