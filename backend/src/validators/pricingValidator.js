const { body, param, query } = require('express-validator');
const { PRICING_RULE_STATUSES } = require('../constants/pricingConstants');

const uuidParam = (field, label) =>
  param(field).isUUID().withMessage(`${label} must be a valid UUID.`);

const pricingRuleIdParamValidator = [uuidParam('id', 'Pricing rule ID')];

const listPricingRulesValidator = [
  query('vehicle_type_id')
    .optional()
    .isUUID()
    .withMessage('vehicle_type_id must be a valid UUID.'),
  query('status')
    .optional()
    .isIn(PRICING_RULE_STATUSES)
    .withMessage(`status must be one of: ${PRICING_RULE_STATUSES.join(', ')}.`),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('search must be between 1 and 100 characters.')
];

const pricingRuleBodyValidator = [
  body('vehicle_type_id')
    .notEmpty()
    .withMessage('Vehicle type is required.')
    .isUUID()
    .withMessage('Vehicle type must be a valid UUID.'),
  body('base_fare')
    .notEmpty()
    .withMessage('Base fare is required.')
    .isFloat({ min: 0 })
    .withMessage('Base fare must be 0 or greater.'),
  body('per_km_rate')
    .notEmpty()
    .withMessage('Per KM rate is required.')
    .isFloat({ min: 0 })
    .withMessage('Per KM rate must be 0 or greater.'),
  body('per_kg_rate')
    .notEmpty()
    .withMessage('Per KG rate is required.')
    .isFloat({ min: 0 })
    .withMessage('Per KG rate must be 0 or greater.'),
  body('minimum_fare')
    .notEmpty()
    .withMessage('Minimum fare is required.')
    .isFloat({ min: 0 })
    .withMessage('Minimum fare must be 0 or greater.'),
  body('status')
    .optional()
    .isIn(PRICING_RULE_STATUSES)
    .withMessage(`Status must be one of: ${PRICING_RULE_STATUSES.join(', ')}.`)
];

const createPricingRuleValidator = pricingRuleBodyValidator;

const updatePricingRuleValidator = [
  ...pricingRuleIdParamValidator,
  body('vehicle_type_id')
    .optional()
    .isUUID()
    .withMessage('Vehicle type must be a valid UUID.'),
  body('base_fare')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base fare must be 0 or greater.'),
  body('per_km_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Per KM rate must be 0 or greater.'),
  body('per_kg_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Per KG rate must be 0 or greater.'),
  body('minimum_fare')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum fare must be 0 or greater.'),
  body('status')
    .optional()
    .isIn(PRICING_RULE_STATUSES)
    .withMessage(`Status must be one of: ${PRICING_RULE_STATUSES.join(', ')}.`)
];

const estimateFareValidator = [
  body('vehicle_type_id')
    .notEmpty()
    .withMessage('Vehicle type is required.')
    .isUUID()
    .withMessage('Vehicle type must be a valid UUID.'),
  body('weight')
    .notEmpty()
    .withMessage('Weight is required.')
    .isFloat({ gt: 0 })
    .withMessage('Weight must be greater than 0.'),
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
    .withMessage('Delivery longitude must be between -180 and 180.')
];

module.exports = {
  pricingRuleIdParamValidator,
  listPricingRulesValidator,
  createPricingRuleValidator,
  updatePricingRuleValidator,
  estimateFareValidator
};
