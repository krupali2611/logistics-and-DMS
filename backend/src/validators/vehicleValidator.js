const { body, param, query } = require('express-validator');
const {
  VEHICLE_STATUS,
  VEHICLE_VERIFICATION_STATUS,
  VEHICLE_AVAILABILITY_STATUS,
  VEHICLE_DOCUMENT_TYPES,
  DRIVER_VEHICLE_ASSIGNMENT_STATUS
} = require('../constants/vehicleConstants');

const ACTIVE_INACTIVE_STATUS = ['ACTIVE', 'INACTIVE'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'LPG', 'OTHER'];

const uuidParam = (field, label) =>
  param(field).isUUID().withMessage(`${label} must be a valid UUID.`);

const optionalFileRule = (field, label) =>
  body(field)
    .optional()
    .custom((value) => {
      if (!value?.content || !value?.original_name) {
        throw new Error(`${label} must include content and original_name.`);
      }
      return true;
    });

const createVehicleTypeValidator = [
  body('type_name')
    .trim()
    .notEmpty()
    .withMessage('Type name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Type name must be between 2 and 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters.'),
  body('min_capacity')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Minimum capacity must be a non-negative number.'),
  body('max_capacity')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Maximum capacity must be a non-negative number.'),
  body('status')
    .optional()
    .isIn(ACTIVE_INACTIVE_STATUS)
    .withMessage(`Status must be one of: ${ACTIVE_INACTIVE_STATUS.join(', ')}.`)
];

const updateVehicleTypeValidator = [
  uuidParam('id', 'Vehicle type ID'),
  body('type_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Type name must be between 2 and 100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters.'),
  body('min_capacity')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Minimum capacity must be a non-negative number.'),
  body('max_capacity')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Maximum capacity must be a non-negative number.'),
  body('status')
    .optional()
    .isIn(ACTIVE_INACTIVE_STATUS)
    .withMessage(`Status must be one of: ${ACTIVE_INACTIVE_STATUS.join(', ')}.`)
];

const listVehicleTypesValidator = [
  query('status')
    .optional({ values: 'falsy' })
    .isIn(ACTIVE_INACTIVE_STATUS)
    .withMessage(`Status must be one of: ${ACTIVE_INACTIVE_STATUS.join(', ')}.`)
];

const createVehicleValidator = [
  body('vehicle_number')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required.')
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle number must be between 3 and 50 characters.'),
  body('vehicle_type_id').isUUID().withMessage('Vehicle type is required.'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand must be between 2 and 100 characters.'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required.')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters.'),
  body('manufacturing_year')
    .notEmpty()
    .withMessage('Manufacturing year is required.')
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage('Manufacturing year must be valid.'),
  body('fuel_type')
    .trim()
    .notEmpty()
    .withMessage('Fuel type is required.')
    .isIn(FUEL_TYPES)
    .withMessage(`Fuel type must be one of: ${FUEL_TYPES.join(', ')}.`),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required.')
    .isFloat({ min: 0 })
    .withMessage('Capacity must be a non-negative number.'),
  body('insurance_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Insurance number must be at most 100 characters.'),
  body('insurance_expiry').optional().isISO8601().withMessage('Insurance expiry must be a valid date.'),
  body('registration_number')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required.')
    .isLength({ min: 3, max: 100 })
    .withMessage('Registration number must be between 3 and 100 characters.'),
  body('registration_expiry')
    .optional()
    .isISO8601()
    .withMessage('Registration expiry must be a valid date.'),
  body('status').optional().isIn(VEHICLE_STATUS).withMessage(`Status must be one of: ${VEHICLE_STATUS.join(', ')}.`),
  body('verification_status')
    .optional()
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`),
  body('availability_status')
    .optional()
    .isIn(VEHICLE_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${VEHICLE_AVAILABILITY_STATUS.join(', ')}.`)
];

const updateVehicleValidator = [
  uuidParam('id', 'Vehicle ID'),
  body('vehicle_number')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Vehicle number must be between 3 and 50 characters.'),
  body('vehicle_type_id').optional().isUUID().withMessage('Vehicle type must be a valid UUID.'),
  body('brand').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Brand must be between 2 and 100 characters.'),
  body('model').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Model must be between 1 and 100 characters.'),
  body('manufacturing_year')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage('Manufacturing year must be valid.'),
  body('fuel_type')
    .optional()
    .trim()
    .isIn(FUEL_TYPES)
    .withMessage(`Fuel type must be one of: ${FUEL_TYPES.join(', ')}.`),
  body('capacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacity must be a non-negative number.'),
  body('insurance_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Insurance number must be at most 100 characters.'),
  body('insurance_expiry').optional().isISO8601().withMessage('Insurance expiry must be a valid date.'),
  body('registration_number')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Registration number must be between 3 and 100 characters.'),
  body('registration_expiry')
    .optional()
    .isISO8601()
    .withMessage('Registration expiry must be a valid date.'),
  body('status').optional().isIn(VEHICLE_STATUS).withMessage(`Status must be one of: ${VEHICLE_STATUS.join(', ')}.`),
  body('verification_status')
    .optional()
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`),
  body('availability_status')
    .optional()
    .isIn(VEHICLE_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${VEHICLE_AVAILABILITY_STATUS.join(', ')}.`)
];

const listVehiclesValidator = [
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('status')
    .optional({ values: 'falsy' })
    .isIn(VEHICLE_STATUS)
    .withMessage(`Status must be one of: ${VEHICLE_STATUS.join(', ')}.`),
  query('verification_status')
    .optional({ values: 'falsy' })
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`),
  query('availability_status')
    .optional({ values: 'falsy' })
    .isIn(VEHICLE_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${VEHICLE_AVAILABILITY_STATUS.join(', ')}.`),
  query('vehicle_type_id')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Vehicle type filter must be a valid UUID.')
];

const updateVehicleStatusValidator = [
  uuidParam('id', 'Vehicle ID'),
  body('status').notEmpty().withMessage('Status is required.').isIn(VEHICLE_STATUS).withMessage(`Status must be one of: ${VEHICLE_STATUS.join(', ')}.`)
];

const verifyVehicleValidator = [
  uuidParam('id', 'Vehicle ID'),
  body('verification_status')
    .notEmpty()
    .withMessage('Verification status is required.')
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`)
];

const updateVehicleAvailabilityValidator = [
  uuidParam('id', 'Vehicle ID'),
  body('availability_status')
    .notEmpty()
    .withMessage('Availability status is required.')
    .isIn(VEHICLE_AVAILABILITY_STATUS)
    .withMessage(`Availability status must be one of: ${VEHICLE_AVAILABILITY_STATUS.join(', ')}.`)
];

const createVehicleDocumentValidator = [
  uuidParam('id', 'Vehicle ID'),
  body('document_type')
    .notEmpty()
    .withMessage('Document type is required.')
    .isIn(VEHICLE_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${VEHICLE_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number').trim().notEmpty().withMessage('Document number is required.').isLength({ max: 100 }).withMessage('Document number must be at most 100 characters.'),
  body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date.'),
  body('verification_status')
    .optional()
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks must be at most 1000 characters.'),
  body('document_file').custom((value) => {
    if (!value?.content || !value?.original_name) {
      throw new Error('Document file must include content and original_name.');
    }
    return true;
  })
];

const updateVehicleDocumentValidator = [
  uuidParam('id', 'Vehicle document ID'),
  body('document_type')
    .optional()
    .isIn(VEHICLE_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${VEHICLE_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Document number must be between 1 and 100 characters.'),
  body('expiry_date').optional().isISO8601().withMessage('Expiry date must be a valid date.'),
  body('verification_status')
    .optional()
    .isIn(VEHICLE_VERIFICATION_STATUS)
    .withMessage(`Verification status must be one of: ${VEHICLE_VERIFICATION_STATUS.join(', ')}.`),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks must be at most 1000 characters.'),
  optionalFileRule('document_file', 'Document file')
];

const createAssignmentValidator = [
  body('driver_id').isUUID().withMessage('Driver ID is required.'),
  body('vehicle_id').isUUID().withMessage('Vehicle ID is required.'),
  body('assigned_at').optional().isISO8601().withMessage('Assigned at must be a valid date.')
];

const listAssignmentsValidator = [
  query('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('status')
    .optional({ values: 'falsy' })
    .isIn(DRIVER_VEHICLE_ASSIGNMENT_STATUS)
    .withMessage(`Status must be one of: ${DRIVER_VEHICLE_ASSIGNMENT_STATUS.join(', ')}.`),
  query('driver_id')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Driver filter must be a valid UUID.'),
  query('vehicle_id')
    .optional({ values: 'falsy' })
    .isUUID()
    .withMessage('Vehicle filter must be a valid UUID.')
];

module.exports = {
  FUEL_TYPES,
  listVehicleTypesValidator,
  createVehicleTypeValidator,
  updateVehicleTypeValidator,
  vehicleTypeIdParamValidator: [uuidParam('id', 'Vehicle type ID')],
  listVehiclesValidator,
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdParamValidator: [uuidParam('id', 'Vehicle ID')],
  updateVehicleStatusValidator,
  verifyVehicleValidator,
  updateVehicleAvailabilityValidator,
  createVehicleDocumentValidator,
  updateVehicleDocumentValidator,
  vehicleDocumentIdParamValidator: [uuidParam('id', 'Vehicle document ID')],
  createAssignmentValidator,
  listAssignmentsValidator,
  assignmentIdParamValidator: [uuidParam('id', 'Assignment ID')]
};
