const pricingService = require('../services/pricingService');
const ApiResponse = require('../utils/ApiResponse');

const listPricingRules = async (req, res) => {
  const pricingRules = await pricingService.listPricingRules(req.query);
  return ApiResponse.success(res, 'Pricing rules fetched successfully.', {
    pricingRules: pricingRules.map(pricingService.mapPricingRuleDto)
  });
};

const getPricingRuleById = async (req, res) => {
  const pricingRule = await pricingService.getPricingRuleById(req.params.id);
  return ApiResponse.success(res, 'Pricing rule fetched successfully.', {
    pricingRule: pricingService.mapPricingRuleDto(pricingRule)
  });
};

const createPricingRule = async (req, res) => {
  const pricingRule = await pricingService.createPricingRule(req.body);
  return ApiResponse.success(
    res,
    'Pricing rule created successfully.',
    {
      pricingRule: pricingService.mapPricingRuleDto(pricingRule)
    },
    201
  );
};

const updatePricingRule = async (req, res) => {
  const pricingRule = await pricingService.updatePricingRule(req.params.id, req.body);
  return ApiResponse.success(res, 'Pricing rule updated successfully.', {
    pricingRule: pricingService.mapPricingRuleDto(pricingRule)
  });
};

const deletePricingRule = async (req, res) => {
  await pricingService.deletePricingRule(req.params.id);
  return ApiResponse.success(res, 'Pricing rule deleted successfully.');
};

const estimateFare = async (req, res) => {
  const estimation = await pricingService.estimateFare(req.body);
  return ApiResponse.success(
    res,
    'Fare estimated successfully.',
    {
      estimation: pricingService.mapFareEstimationDto(estimation.estimation, estimation)
    },
    201
  );
};

module.exports = {
  listPricingRules,
  getPricingRuleById,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  estimateFare
};
