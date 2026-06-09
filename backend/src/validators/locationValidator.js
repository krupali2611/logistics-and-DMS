const { body, query } = require('express-validator');
const { CUSTOMER_ADDRESS_TYPES } = require('../constants/customerConstants');

const searchLocationsValidator = [
  query('q')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Search query must be between 3 and 200 characters.'),
  query('customer_id').optional().isUUID().withMessage('customer_id must be a valid UUID.'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('limit must be between 1 and 10.')
];

const getPlaceDetailsValidator = [
  query('place_id').optional().trim().isLength({ min: 2, max: 255 }),
  query('customer_id').optional().isUUID().withMessage('customer_id must be a valid UUID.'),
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('latitude must be between -90 and 90.'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('longitude must be between -180 and 180.'),
  query().custom((value, { req }) => {
    if (!req.query.place_id && (req.query.latitude === undefined || req.query.longitude === undefined)) {
      throw new Error('place_id or latitude/longitude is required.');
    }
    return true;
  })
];

const saveLocationValidator = [
  body('customer_id').isUUID().withMessage('customer_id must be a valid UUID.'),
  body('address_type')
    .optional()
    .isIn(CUSTOMER_ADDRESS_TYPES)
    .withMessage(`address_type must be one of: ${CUSTOMER_ADDRESS_TYPES.join(', ')}.`),
  body('is_default').optional().isBoolean().withMessage('is_default must be true or false.'),
  body('is_favorite').optional().isBoolean().withMessage('is_favorite must be true or false.'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('location.address is required.')
    .isLength({ max: 5000 })
    .withMessage('location.address must be at most 5000 characters.'),
  body('location.place_id').optional().trim().isLength({ max: 255 }),
  body('location.latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('location.latitude must be between -90 and 90.'),
  body('location.longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('location.longitude must be between -180 and 180.'),
  body('location.city').optional().trim().isLength({ max: 100 }),
  body('location.state').optional().trim().isLength({ max: 100 }),
  body('location.country').optional().trim().isLength({ max: 100 }),
  body('location.pincode').optional().trim().isLength({ max: 20 })
];

module.exports = {
  searchLocationsValidator,
  getPlaceDetailsValidator,
  saveLocationValidator
};
