const express = require('express');
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  documentIdParamValidator,
  updateDriverDocumentValidator
} = require('../validators/driverValidator');

const router = express.Router();

router.use(authMiddleware);

router.put(
  '/:id',
  permissionMiddleware('driver_update'),
  updateDriverDocumentValidator,
  validationMiddleware,
  asyncHandler(driverController.updateDriverDocument)
);

router.delete(
  '/:id',
  permissionMiddleware('driver_delete'),
  documentIdParamValidator,
  validationMiddleware,
  asyncHandler(driverController.deleteDriverDocument)
);

module.exports = router;
