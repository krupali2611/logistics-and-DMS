const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const customerOwnershipMiddleware = require('../middleware/customerOwnershipMiddleware');
const {
  shipmentIdParamValidator,
  createShipmentValidator,
  listShipmentsValidator
} = require('../validators/shipmentValidator');

const router = express.Router();

router.use(customerAuthMiddleware);

router.get(
  '/dashboard/stats',
  asyncHandler(shipmentController.getShipmentDashboardStats)
);
router.get(
  '/',
  listShipmentsValidator,
  validationMiddleware,
  asyncHandler(shipmentController.listMyShipments)
);
router.post(
  '/',
  customerOwnershipMiddleware(),
  createShipmentValidator,
  validationMiddleware,
  asyncHandler(shipmentController.createShipment)
);
router.get(
  '/:id',
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.getMyShipmentById)
);
router.get(
  '/:id/track',
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.trackShipment)
);

module.exports = router;
