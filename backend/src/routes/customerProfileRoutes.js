const express = require('express');
const customerAuthController = require('../controllers/customerAuthController');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  updateCustomerProfileValidator,
  changeCustomerPasswordValidator
} = require('../validators/customerAuthValidator');

const router = express.Router();

router.use(customerAuthMiddleware);

router.get('/profile', asyncHandler(customerAuthController.getProfile));
router.put(
  '/profile',
  updateCustomerProfileValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.updateProfile)
);
router.put(
  '/change-password',
  changeCustomerPasswordValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.changePassword)
);

module.exports = router;
