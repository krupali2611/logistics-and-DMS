const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listVehicleTypesValidator,
  createVehicleTypeValidator,
  updateVehicleTypeValidator,
  vehicleTypeIdParamValidator
} = require('../validators/vehicleValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  permissionMiddleware('vehicle_view'),
  listVehicleTypesValidator,
  validationMiddleware,
  asyncHandler(vehicleController.listVehicleTypes)
);
router.post(
  '/',
  permissionMiddleware('vehicle_create'),
  createVehicleTypeValidator,
  validationMiddleware,
  asyncHandler(vehicleController.createVehicleType)
);
router.get(
  '/:id',
  permissionMiddleware('vehicle_view'),
  vehicleTypeIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.getVehicleTypeById)
);
router.put(
  '/:id',
  permissionMiddleware('vehicle_update'),
  updateVehicleTypeValidator,
  validationMiddleware,
  asyncHandler(vehicleController.updateVehicleType)
);
router.delete(
  '/:id',
  permissionMiddleware('vehicle_delete'),
  vehicleTypeIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.deleteVehicleType)
);

module.exports = router;
