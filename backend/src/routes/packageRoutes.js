const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  shipmentPackageIdParamValidator,
  updateShipmentPackageValidator
} = require('../validators/shipmentValidator');

const router = express.Router();

router.use(authMiddleware);

router.put(
  '/:id',
  permissionMiddleware('shipment_update'),
  updateShipmentPackageValidator,
  validationMiddleware,
  asyncHandler(shipmentController.updateShipmentPackage)
);
router.delete(
  '/:id',
  permissionMiddleware('shipment_update'),
  shipmentPackageIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.deleteShipmentPackage)
);

module.exports = router;
