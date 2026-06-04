const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  customerAddressIdParamValidator,
  updateCustomerAddressValidator
} = require('../validators/customerValidator');

const router = express.Router();

router.use(authMiddleware);

router.put(
  '/:id',
  permissionMiddleware('customer_update'),
  updateCustomerAddressValidator,
  validationMiddleware,
  asyncHandler(customerController.updateCustomerAddress)
);
router.delete(
  '/:id',
  permissionMiddleware('customer_delete'),
  customerAddressIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.deleteCustomerAddress)
);

module.exports = router;
