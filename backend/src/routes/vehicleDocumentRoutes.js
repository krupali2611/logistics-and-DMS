const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  vehicleDocumentIdParamValidator,
  updateVehicleDocumentValidator
} = require('../validators/vehicleValidator');

const router = express.Router();

router.use(authMiddleware);

router.put(
  '/:id',
  permissionMiddleware('vehicle_update'),
  updateVehicleDocumentValidator,
  validationMiddleware,
  asyncHandler(vehicleController.updateVehicleDocument)
);
router.delete(
  '/:id',
  permissionMiddleware('vehicle_delete'),
  vehicleDocumentIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.deleteVehicleDocument)
);

module.exports = router;
