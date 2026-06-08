const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { customerNoteIdParamValidator } = require('../validators/customerValidator');

const router = express.Router();

router.use(authMiddleware);

router.delete(
  '/:id',
  permissionMiddleware('customer_update'),
  customerNoteIdParamValidator,
  validationMiddleware,
  asyncHandler(customerController.deleteCustomerNote)
);

module.exports = router;
