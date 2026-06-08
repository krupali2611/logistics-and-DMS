const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listCustomersValidator,
  createCustomerValidator,
  updateCustomerValidator,
  customerIdParamValidator,
  updateCustomerStatusValidator,
  verifyCustomerValidator,
  createCustomerAddressValidator,
  createCustomerDocumentValidator,
  createCustomerNoteValidator
} = require('../validators/customerValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard/stats',
  permissionMiddleware('customer_view'),
  asyncHandler(customerController.getCustomerDashboardStats)
);
router.get(
  '/',
  permissionMiddleware('customer_view'),
  listCustomersValidator,
  validationMiddleware,
  asyncHandler(customerController.listCustomers)
);
router.post(
  '/',
  permissionMiddleware('customer_create'),
  createCustomerValidator,
  validationMiddleware,
  asyncHandler(customerController.createCustomer)
);
router.get(
  '/:id',
  permissionMiddleware('customer_view'),
  customerIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.getCustomerById)
);
router.put(
  '/:id',
  permissionMiddleware('customer_update'),
  updateCustomerValidator,
  validationMiddleware,
  asyncHandler(customerController.updateCustomer)
);
router.patch(
  '/:id/status',
  permissionMiddleware('customer_update'),
  updateCustomerStatusValidator,
  validationMiddleware,
  asyncHandler(customerController.updateCustomerStatus)
);
router.patch(
  '/:id/verify',
  permissionMiddleware('customer_verify'),
  verifyCustomerValidator,
  validationMiddleware,
  asyncHandler(customerController.verifyCustomer)
);
router.post(
  '/:id/addresses',
  permissionMiddleware('customer_update'),
  createCustomerAddressValidator,
  validationMiddleware,
  asyncHandler(customerController.createCustomerAddress)
);
router.get(
  '/:id/addresses',
  permissionMiddleware('customer_view'),
  customerIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.listCustomerAddresses)
);
router.post(
  '/:id/documents',
  permissionMiddleware('customer_update'),
  createCustomerDocumentValidator,
  validationMiddleware,
  asyncHandler(customerController.createCustomerDocument)
);
router.get(
  '/:id/documents',
  permissionMiddleware('customer_view'),
  customerIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.listCustomerDocuments)
);
router.post(
  '/:id/notes',
  permissionMiddleware('customer_update'),
  createCustomerNoteValidator,
  validationMiddleware,
  asyncHandler(customerController.createCustomerNote)
);
router.get(
  '/:id/notes',
  permissionMiddleware('customer_view'),
  customerIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.listCustomerNotes)
);

module.exports = router;
