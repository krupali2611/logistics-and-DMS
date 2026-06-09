const { body, param, query } = require('express-validator');
const {
  SHIPMENT_TYPES,
  SHIPMENT_PRIORITIES,
  SHIPMENT_STATUSES
} = require('../constants/shipmentConstants');

const uuidParam = (field, label) =>
  param(field).isUUID().withMessage(`${label} must be a valid UUID.`);

const validatePackageShape = (pkg, indexLabel = 'Package') => {
  if (!pkg || typeof pkg !== 'object') {
    throw new Error(`${indexLabel} payload is required.`);
  }

  if (!pkg.package_name?.toString().trim()) {
    throw new Error(`${indexLabel} name is required.`);
  }

  if (!pkg.package_type?.toString().trim()) {
    throw new Error(`${indexLabel} type is required.`);
  }

  const numericFields = [
    ['weight', 0],
    ['length', 0],
    ['width', 0],
    ['height', 0]
  ];

  numericFields.forEach(([fieldName, threshold]) => {
    const value = Number(pkg[fieldName]);
    if (!Number.isFinite(value) || value <= threshold) {
      throw new Error(`${indexLabel} ${fieldName} must be greater than 0.`);
    }
  });

  const quantity = Number(pkg.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`${indexLabel} quantity must be at least 1.`);
  }

  if (pkg.declared_value !== undefined && pkg.declared_value !== null && pkg.declared_value !== '') {
    const declaredValue = Number(pkg.declared_value);
    if (!Number.isFinite(declaredValue) || declaredValue < 0) {
      throw new Error(`${indexLabel} declared value must be 0 or greater.`);
    }
  }
};

const packageRule = (path) => [
  body(`${path}.package_name`)
    .trim()
    .notEmpty()
    .withMessage('Package name is required.')
    .isLength({ max: 150 })
    .withMessage('Package name must be at most 150 characters.'),
  body(`${path}.package_type`)
    .trim()
    .notEmpty()
    .withMessage('Package type is required.')
    .isLength({ max: 100 })
    .withMessage('Package type must be at most 100 characters.'),
  body(`${path}.weight`)
    .notEmpty()
    .withMessage('Package weight is required.')
    .isFloat({ gt: 0 })
    .withMessage('Package weight must be greater than 0.'),
  body(`${path}.length`)
    .notEmpty()
    .withMessage('Package length is required.')
    .isFloat({ gt: 0 })
    .withMessage('Package length must be greater than 0.'),
  body(`${path}.width`)
    .notEmpty()
    .withMessage('Package width is required.')
    .isFloat({ gt: 0 })
    .withMessage('Package width must be greater than 0.'),
  body(`${path}.height`)
    .notEmpty()
    .withMessage('Package height is required.')
    .isFloat({ gt: 0 })
    .withMessage('Package height must be greater than 0.'),
  body(`${path}.quantity`)
    .notEmpty()
    .withMessage('Package quantity is required.')
    .isInt({ min: 1 })
    .withMessage('Package quantity must be at least 1.'),
  body(`${path}.declared_value`)
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Declared value must be 0 or greater.')
];

const shipmentIdParamValidator = [uuidParam('id', 'Shipment ID')];
const shipmentPackageIdParamValidator = [uuidParam('id', 'Shipment package ID')];
const shipmentAttachmentIdParamValidator = [uuidParam('id', 'Shipment attachment ID')];
const locationRules = (prefix, label) => [
  body(`${prefix}_address_id`)
    .optional()
    .isUUID()
    .withMessage(`${label} saved address must be a valid UUID.`),
  body(`${prefix}_address`)
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`${label} address cannot be empty.`)
    .isLength({ max: 5000 })
    .withMessage(`${label} address must be at most 5000 characters.`),
  body(`${prefix}_address_snapshot`)
    .optional()
    .trim()
    .notEmpty()
    .withMessage(`${label} address snapshot cannot be empty.`)
    .isLength({ max: 5000 })
    .withMessage(`${label} address snapshot must be at most 5000 characters.`),
  body(`${prefix}_latitude`)
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage(`${label} latitude must be between -90 and 90.`),
  body(`${prefix}_longitude`)
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage(`${label} longitude must be between -180 and 180.`),
  body(`${prefix}_place_id`)
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage(`${label} place ID must be at most 255 characters.`),
  body(`${prefix}_city`)
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${label} city must be at most 100 characters.`),
  body(`${prefix}_state`)
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${label} state must be at most 100 characters.`),
  body(`${prefix}_country`)
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(`${label} country must be at most 100 characters.`),
  body(`${prefix}_pincode`)
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage(`${label} pincode must be at most 20 characters.`)
];

const locationSelectionRule = (required) =>
  body().custom((value) => {
    const hasPickupSelection = Boolean(value.pickup_address_id || value.pickup_address);
    const hasDeliverySelection = Boolean(value.delivery_address_id || value.delivery_address);

    if (required && !hasPickupSelection) {
      throw new Error('Pickup location is required.');
    }

    if (required && !hasDeliverySelection) {
      throw new Error('Delivery location is required.');
    }

    if (
      value.pickup_address_id &&
      value.delivery_address_id &&
      value.pickup_address_id === value.delivery_address_id
    ) {
      throw new Error('Pickup and delivery saved addresses must be different.');
    }

    return true;
  });

const baseShipmentValidators = [
  body('customer_id')
    .optional()
    .isUUID()
    .withMessage('Customer must be a valid UUID.'),
  body('vehicle_type_id').notEmpty().withMessage('Vehicle type is required.').isUUID(),
  body('shipment_type')
    .notEmpty()
    .withMessage('Shipment type is required.')
    .isIn(SHIPMENT_TYPES)
    .withMessage(`Shipment type must be one of: ${SHIPMENT_TYPES.join(', ')}.`),
  body('priority')
    .optional()
    .isIn(SHIPMENT_PRIORITIES)
    .withMessage(`Priority must be one of: ${SHIPMENT_PRIORITIES.join(', ')}.`),
  body('estimated_distance')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Estimated distance must be 0 or greater.'),
  body('estimated_delivery_date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date.'),
  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Special instructions must be at most 5000 characters.'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PENDING_ASSIGNMENT'])
    .withMessage('Shipment status can only start as DRAFT or PENDING_ASSIGNMENT.'),
  body('packages')
    .isArray({ min: 1 })
    .withMessage('At least one package is required.')
];

const createShipmentValidator = [
  ...baseShipmentValidators,
  ...locationRules('pickup', 'Pickup'),
  ...locationRules('delivery', 'Delivery'),
  locationSelectionRule(true),
  ...packageRule('packages.*')
];

const previewShipmentRouteValidator = [
  body('pickup_coordinates.latitude')
    .notEmpty()
    .withMessage('Pickup latitude is required.')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pickup latitude must be between -90 and 90.'),
  body('pickup_coordinates.longitude')
    .notEmpty()
    .withMessage('Pickup longitude is required.')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Pickup longitude must be between -180 and 180.'),
  body('delivery_coordinates.latitude')
    .notEmpty()
    .withMessage('Delivery latitude is required.')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Delivery latitude must be between -90 and 90.'),
  body('delivery_coordinates.longitude')
    .notEmpty()
    .withMessage('Delivery longitude is required.')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Delivery longitude must be between -180 and 180.'),
  body('departure_at')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Departure time must be a valid date.'),
  body('vehicle_type_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Vehicle type name must be between 1 and 120 characters.')
];

const updateShipmentValidator = [
  ...shipmentIdParamValidator,
  body('customer_id').optional().isUUID().withMessage('Customer must be a valid UUID.'),
  body('vehicle_type_id').optional().isUUID().withMessage('Vehicle type must be a valid UUID.'),
  body('shipment_type')
    .optional()
    .isIn(SHIPMENT_TYPES)
    .withMessage(`Shipment type must be one of: ${SHIPMENT_TYPES.join(', ')}.`),
  body('priority')
    .optional()
    .isIn(SHIPMENT_PRIORITIES)
    .withMessage(`Priority must be one of: ${SHIPMENT_PRIORITIES.join(', ')}.`),
  body('estimated_distance')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Estimated distance must be 0 or greater.'),
  body('estimated_delivery_date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date.'),
  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Special instructions must be at most 5000 characters.'),
  body('packages')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Packages must be a non-empty array when provided.'),
  body('packages.*.id')
    .optional()
    .isUUID()
    .withMessage('Package ID must be a valid UUID.'),
  ...locationRules('pickup', 'Pickup'),
  ...locationRules('delivery', 'Delivery'),
  locationSelectionRule(false),
  ...packageRule('packages.*')
];

const listShipmentsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('status')
    .optional()
    .isIn(SHIPMENT_STATUSES)
    .withMessage(`Status must be one of: ${SHIPMENT_STATUSES.join(', ')}.`),
  query('priority')
    .optional()
    .isIn(SHIPMENT_PRIORITIES)
    .withMessage(`Priority must be one of: ${SHIPMENT_PRIORITIES.join(', ')}.`),
  query('shipment_type')
    .optional()
    .isIn(SHIPMENT_TYPES)
    .withMessage(`Shipment type must be one of: ${SHIPMENT_TYPES.join(', ')}.`),
  query('customer_id')
    .optional()
    .isUUID()
    .withMessage('customer_id must be a valid UUID.'),
  query('created_from')
    .optional()
    .isISO8601()
    .withMessage('created_from must be a valid date.'),
  query('created_to').optional().isISO8601().withMessage('created_to must be a valid date.')
];

const updateShipmentStatusValidator = [
  ...shipmentIdParamValidator,
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(SHIPMENT_STATUSES)
    .withMessage(`Status must be one of: ${SHIPMENT_STATUSES.join(', ')}.`),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Remarks must be at most 2000 characters.')
];

const cancelShipmentValidator = [
  ...shipmentIdParamValidator,
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Remarks must be at most 2000 characters.'),
  body('cancellation_reason')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cancellation reason must be at most 2000 characters.')
];

const createShipmentPackagesValidator = [
  ...shipmentIdParamValidator,
  body().custom((value) => {
    const packages = Array.isArray(value) ? value : value.packages || [value];

    if (!Array.isArray(packages) || packages.length === 0) {
      throw new Error('At least one package payload is required.');
    }

    packages.forEach((pkg, index) => validatePackageShape(pkg, `Package ${index + 1}`));
    return true;
  })
];

const updateShipmentPackageValidator = [
  ...shipmentPackageIdParamValidator,
  body('package_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Package name must be between 1 and 150 characters.'),
  body('package_type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Package type must be between 1 and 100 characters.'),
  body('weight')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Package weight must be greater than 0.'),
  body('length')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Package length must be greater than 0.'),
  body('width')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Package width must be greater than 0.'),
  body('height')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Package height must be greater than 0.'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Package quantity must be at least 1.'),
  body('declared_value')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Declared value must be 0 or greater.')
];

const createShipmentAttachmentValidator = [
  ...shipmentIdParamValidator,
  body('file').custom((value) => {
    if (!value?.content || !value?.original_name) {
      throw new Error('Attachment file must include content and original_name.');
    }

    return true;
  })
];

module.exports = {
  shipmentIdParamValidator,
  shipmentPackageIdParamValidator,
  shipmentAttachmentIdParamValidator,
  previewShipmentRouteValidator,
  createShipmentValidator,
  updateShipmentValidator,
  listShipmentsValidator,
  updateShipmentStatusValidator,
  cancelShipmentValidator,
  createShipmentPackagesValidator,
  updateShipmentPackageValidator,
  createShipmentAttachmentValidator
};
