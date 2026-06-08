const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listVehiclesValidator,
  createVehicleValidator,
  updateVehicleValidator,
  vehicleIdParamValidator,
  updateVehicleStatusValidator,
  updateVehicleAvailabilityValidator,
  verifyVehicleValidator,
  createVehicleDocumentValidator,
  assignVehicleByVehicleIdValidator,
  vehicleHistoryValidator,
  returnVehicleValidator
} = require('../validators/vehicleValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard/stats',
  permissionMiddleware('vehicle_view'),
  asyncHandler(vehicleController.getVehicleDashboardStats)
);
router.get(
  '/available-for-assignment',
  permissionMiddleware('vehicle_assign'),
  asyncHandler(vehicleController.getAvailableVehiclesForAssignment)
);
router.get(
  '/',
  permissionMiddleware('vehicle_view'),
  listVehiclesValidator,
  validationMiddleware,
  asyncHandler(vehicleController.listVehicles)
);
router.post(
  '/',
  permissionMiddleware('vehicle_create'),
  createVehicleValidator,
  validationMiddleware,
  asyncHandler(vehicleController.createVehicle)
);
router.get(
  '/:id',
  permissionMiddleware('vehicle_view'),
  vehicleIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.getVehicleById)
);
router.put(
  '/:id',
  permissionMiddleware('vehicle_update'),
  updateVehicleValidator,
  validationMiddleware,
  asyncHandler(vehicleController.updateVehicle)
);
router.delete(
  '/:id',
  permissionMiddleware('vehicle_delete'),
  vehicleIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.deleteVehicle)
);
router.patch(
  '/:id/status',
  permissionMiddleware('vehicle_update'),
  updateVehicleStatusValidator,
  validationMiddleware,
  asyncHandler(vehicleController.updateVehicleStatus)
);
router.patch(
  '/:id/verify',
  permissionMiddleware('vehicle_verify'),
  verifyVehicleValidator,
  validationMiddleware,
  asyncHandler(vehicleController.verifyVehicle)
);
router.patch(
  '/:id/availability',
  permissionMiddleware('vehicle_update'),
  updateVehicleAvailabilityValidator,
  validationMiddleware,
  asyncHandler(vehicleController.updateVehicleAvailability)
);
router.post(
  '/:vehicleId/assign',
  permissionMiddleware('vehicle_assign'),
  assignVehicleByVehicleIdValidator,
  validationMiddleware,
  asyncHandler(vehicleController.assignVehicle)
);
router.post(
  '/:vehicleId/return',
  permissionMiddleware('vehicle_assign'),
  returnVehicleValidator,
  validationMiddleware,
  asyncHandler(vehicleController.returnVehicle)
);
router.get(
  '/:vehicleId/history',
  permissionMiddleware('vehicle_assign'),
  vehicleHistoryValidator,
  validationMiddleware,
  asyncHandler(vehicleController.getVehicleAssignmentHistory)
);
router.post(
  '/:id/documents',
  permissionMiddleware('vehicle_update'),
  createVehicleDocumentValidator,
  validationMiddleware,
  asyncHandler(vehicleController.createVehicleDocument)
);
router.get(
  '/:id/documents',
  permissionMiddleware('vehicle_view'),
  vehicleIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.listVehicleDocuments)
);

module.exports = router;
