const express = require('express');
const pricingController = require('../controllers/pricingController');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { estimateFareValidator } = require('../validators/pricingValidator');

const router = express.Router();

router.use(customerAuthMiddleware);

router.post(
  '/estimate',
  estimateFareValidator,
  validationMiddleware,
  asyncHandler(pricingController.estimateFare)
);

module.exports = router;
