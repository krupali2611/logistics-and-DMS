const { body, param, query } = require('express-validator');
const {
  DRIVER_STATUS,
  DRIVER_AVAILABILITY_STATUS,
  DRIVER_VERIFICATION_STATUS,
  DRIVER_DOCUMENT_TYPES
} = require('../constants/driverConstants');

const uuidParam = (field, label) =>
  param(field).isUUID().withMessage(`${label} must be a valid UUID.`);

const emailRule = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required.')
  .isEmail()
  .withMessage('Please provide a valid email.')
  .normalizeEmail();

const phoneRule = body('phone')
  .trim()
  .notEmpty()
  .withMessage('Phone is required.')
  .matches(/^[0-9+\-\s]{7,20}$/)
  .withMessage('Phone number must be valid.');

const driverCodeRule = body('driver_code')
  .trim()
  .notEmpty()
  .withMessage('Driver code is required.')
  .matches(/^[A-Z0-9-_/]+$/i)
  .withMessage('Driver code may contain letters, numbers, hyphens, underscores, and slashes.')
  .isLength({ min: 3, max: 50 })
  .withMessage('Driver code must be between 3 and 50 characters.');

const requiredNameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ min: 2, max: 100 })
    .withMessage(`${label} must be between 2 and 100 characters.`);

const optionalFileRule = (field, label) =>
  body(field)
    .optional()
    .custom((value) => {
      if (!value?.content || !value?.original_name) {
        throw new Error(`${label} must include content and original_name.`);
      }
      return true;
    });

const createDriverValidator = [
  driverCodeRule,
  requiredNameRule('first_name', 'First name'),
  requiredNameRule('last_name', 'Last name'),
  emailRule,
  phoneRule,
  body('date_of_birth').optional().isISO8601().withMessage('Date of birth must be a valid date.'),
  body('gender').optional().trim().isLength({ max: 20 }).withMessage('Gender must be at most 20 characters.'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be at most 500 characters.'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City must be at most 100 characters.'),
  body('state').optional().trim().isLength({ max: 100 }).withMessage('State must be at most 100 characters.'),
  body('pincode').optional().trim().isLength({ max: 20 }).withMessage('Pincode must be at most 20 characters.'),
  body('status').optional().isIn(DRIVER_STATUS).withMessage(`Status must be one of: ${DRIVER_STATUS.join(', ')}.`),
  body('availability_status')
    .optional()
    .isIn(DRIVER_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${DRIVER_AVAILABILITY_STATUS.join(', ')}.`),
  body('verification_status')
    .optional()
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`),
  optionalFileRule('profile_image', 'Profile image')
];

const updateDriverValidator = [
  uuidParam('id', 'Driver ID'),
  body('driver_code')
    .optional()
    .trim()
    .matches(/^[A-Z0-9-_/]+$/i)
    .withMessage('Driver code may contain letters, numbers, hyphens, underscores, and slashes.')
    .isLength({ min: 3, max: 50 })
    .withMessage('Driver code must be between 3 and 50 characters.'),
  body('first_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters.'),
  body('last_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('phone').optional().matches(/^[0-9+\-\s]{7,20}$/).withMessage('Phone number must be valid.'),
  body('date_of_birth').optional().isISO8601().withMessage('Date of birth must be a valid date.'),
  body('gender').optional().trim().isLength({ max: 20 }).withMessage('Gender must be at most 20 characters.'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be at most 500 characters.'),
  body('city').optional().trim().isLength({ max: 100 }).withMessage('City must be at most 100 characters.'),
  body('state').optional().trim().isLength({ max: 100 }).withMessage('State must be at most 100 characters.'),
  body('pincode').optional().trim().isLength({ max: 20 }).withMessage('Pincode must be at most 20 characters.'),
  body('status').optional().isIn(DRIVER_STATUS).withMessage(`Status must be one of: ${DRIVER_STATUS.join(', ')}.`),
  body('availability_status')
    .optional()
    .isIn(DRIVER_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${DRIVER_AVAILABILITY_STATUS.join(', ')}.`),
  body('verification_status')
    .optional()
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`),
  optionalFileRule('profile_image', 'Profile image')
];

const listDriversValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('status').optional().isIn(DRIVER_STATUS).withMessage(`Status must be one of: ${DRIVER_STATUS.join(', ')}.`),
  query('availability_status')
    .optional()
    .isIn(DRIVER_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${DRIVER_AVAILABILITY_STATUS.join(', ')}.`),
  query('verification_status')
    .optional()
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`)
];

const driverIdParamValidator = [uuidParam('id', 'Driver ID')];
const documentIdParamValidator = [uuidParam('id', 'Document ID')];

const updateDriverStatusValidator = [
  ...driverIdParamValidator,
  body('status').notEmpty().withMessage('Status is required.').isIn(DRIVER_STATUS).withMessage(`Status must be one of: ${DRIVER_STATUS.join(', ')}.`)
];

const updateDriverAvailabilityValidator = [
  ...driverIdParamValidator,
  body('availability_status')
    .notEmpty()
    .withMessage('Availability status is required.')
    .isIn(DRIVER_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${DRIVER_AVAILABILITY_STATUS.join(', ')}.`)
];

const verifyDriverValidator = [
  ...driverIdParamValidator,
  body('verification_status')
    .notEmpty()
    .withMessage('Verification status is required.')
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`)
];

const createDriverDocumentValidator = [
  ...driverIdParamValidator,
  body('document_type')
    .notEmpty()
    .withMessage('Document type is required.')
    .isIn(DRIVER_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${DRIVER_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number').trim().notEmpty().withMessage('Document number is required.').isLength({ max: 100 }).withMessage('Document number must be at most 100 characters.'),
  body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date.'),
  body('verification_status')
    .optional()
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks must be at most 1000 characters.'),
  body('document_file')
    .custom((value) => {
      if (!value?.content || !value?.original_name) {
        throw new Error('Document file must include content and original_name.');
      }
      return true;
    })
];

const updateDriverDocumentValidator = [
  ...documentIdParamValidator,
  body('document_type')
    .optional()
    .isIn(DRIVER_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${DRIVER_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Document number must be between 1 and 100 characters.'),
  body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date.'),
  body('verification_status')
    .optional()
    .isIn(DRIVER_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${DRIVER_VERIFICATION_STATUS.join(', ')}.`),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks must be at most 1000 characters.'),
  optionalFileRule('document_file', 'Document file')
];

module.exports = {
  listDriversValidator,
  createDriverValidator,
  updateDriverValidator,
  driverIdParamValidator,
  documentIdParamValidator,
  updateDriverStatusValidator,
  updateDriverAvailabilityValidator,
  verifyDriverValidator,
  createDriverDocumentValidator,
  updateDriverDocumentValidator
};
