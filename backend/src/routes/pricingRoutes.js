const express = require('express');
const pricingController = require('../controllers/pricingController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  pricingRuleIdParamValidator,
  listPricingRulesValidator,
  createPricingRuleValidator,
  updatePricingRuleValidator,
  estimateFareValidator
} = require('../validators/pricingValidator');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/estimate',
  permissionMiddleware('pricing_view'),
  estimateFareValidator,
  validationMiddleware,
  asyncHandler(pricingController.estimateFare)
);
router.get(
  '/',
  permissionMiddleware('pricing_view'),
  listPricingRulesValidator,
  validationMiddleware,
  asyncHandler(pricingController.listPricingRules)
);
router.post(
  '/',
  permissionMiddleware('pricing_create'),
  createPricingRuleValidator,
  validationMiddleware,
  asyncHandler(pricingController.createPricingRule)
);
router.get(
  '/:id',
  permissionMiddleware('pricing_view'),
  pricingRuleIdParamValidator,
  validationMiddleware,
  asyncHandler(pricingController.getPricingRuleById)
);
router.put(
  '/:id',
  permissionMiddleware('pricing_update'),
  updatePricingRuleValidator,
  validationMiddleware,
  asyncHandler(pricingController.updatePricingRule)
);
router.delete(
  '/:id',
  permissionMiddleware('pricing_delete'),
  pricingRuleIdParamValidator,
  validationMiddleware,
  asyncHandler(pricingController.deletePricingRule)
);

module.exports = router;
