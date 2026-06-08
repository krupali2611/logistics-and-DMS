const express = require('express');
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { shipmentAttachmentIdParamValidator } = require('../validators/shipmentValidator');

const router = express.Router();

router.use(authMiddleware);

router.delete(
  '/:id',
  permissionMiddleware('shipment_update'),
  shipmentAttachmentIdParamValidator,
  validationMiddleware,
  asyncHandler(shipmentController.deleteShipmentAttachment)
);

module.exports = router;
