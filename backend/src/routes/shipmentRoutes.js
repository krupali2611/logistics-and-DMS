const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  shipmentIdParamValidator,
  createShipmentValidator,
  updateShipmentValidator,
  listShipmentsValidator,
  updateShipmentStatusValidator,
  cancelShipmentValidator,
  createShipmentPackagesValidator,
  createShipmentAttachmentValidator
} = require('../validators/shipmentValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard/stats',
  permissionMiddleware('shipment_view'),
  asyncHandler(shipmentController.getShipmentDashboardStats)
);
router.get(
  '/',
  permissionMiddleware('shipment_view'),
  listShipmentsValidator,
  validationMiddleware,
  asyncHandler(shipmentController.listShipments)
);
router.get(
  '/my',
  permissionMiddleware('shipment_view'),
  listShipmentsValidator,
  validationMiddleware,
  asyncHandler(shipmentController.listMyShipments)
);
router.post(
  '/',
  permissionMiddleware('shipment_create'),
  createShipmentValidator,
  validationMiddleware,
  asyncHandler(shipmentController.createShipment)
);
router.get(
  '/my/:id',
  permissionMiddleware('shipment_view'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.getMyShipmentById)
);
router.get(
  '/:id/track',
  permissionMiddleware('shipment_view'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.trackShipment)
);
router.get(
  '/:id',
  permissionMiddleware('shipment_view'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.getShipmentById)
);
router.put(
  '/:id',
  permissionMiddleware('shipment_update'),
  updateShipmentValidator,
  validationMiddleware,
  asyncHandler(shipmentController.updateShipment)
);
router.delete(
  '/:id',
  permissionMiddleware('shipment_delete'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.deleteShipment)
);
router.patch(
  '/:id/cancel',
  permissionMiddleware('shipment_cancel'),
  cancelShipmentValidator,
  validationMiddleware,
  asyncHandler(shipmentController.cancelShipment)
);
router.patch(
  '/:id/status',
  permissionMiddleware('shipment_status_update'),
  updateShipmentStatusValidator,
  validationMiddleware,
  asyncHandler(shipmentController.updateShipmentStatus)
);
router.post(
  '/:id/packages',
  permissionMiddleware('shipment_update'),
  createShipmentPackagesValidator,
  validationMiddleware,
  asyncHandler(shipmentController.createShipmentPackages)
);
router.get(
  '/:id/packages',
  permissionMiddleware('shipment_view'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.listShipmentPackages)
);
router.post(
  '/:id/attachments',
  permissionMiddleware('shipment_update'),
  createShipmentAttachmentValidator,
  validationMiddleware,
  asyncHandler(shipmentController.createShipmentAttachment)
);
router.get(
  '/:id/attachments',
  permissionMiddleware('shipment_view'),
  shipmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.listShipmentAttachments)
);

module.exports = router;
