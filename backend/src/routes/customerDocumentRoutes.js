const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  customerDocumentIdParamValidator,
  updateCustomerDocumentValidator
} = require('../validators/customerValidator');

const router = express.Router();

router.use(authMiddleware);

router.put(
  '/:id',
  permissionMiddleware('customer_update'),
  updateCustomerDocumentValidator,
  validationMiddleware,
  asyncHandler(customerController.updateCustomerDocument)
);
router.delete(
  '/:id',
  permissionMiddleware('customer_update'),
  customerDocumentIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.deleteCustomerDocument)
);

module.exports = router;
