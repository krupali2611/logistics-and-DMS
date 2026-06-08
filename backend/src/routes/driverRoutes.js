const express = require('express');
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listDriversValidator,
  createDriverValidator,
  updateDriverValidator,
  driverIdParamValidator,
  updateDriverStatusValidator,
  updateDriverAvailabilityValidator,
  verifyDriverValidator,
  createDriverDocumentValidator,
  assignVehicleToDriverValidator,
  returnAssignedVehicleValidator,
  driverVehicleHistoryValidator
} = require('../validators/driverValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard/stats',
  permissionMiddleware('driver_view'),
  asyncHandler(driverController.getDriverDashboardStats)
);
router.get(
  '/available-for-assignment',
  permissionMiddleware('vehicle_assign'),
  asyncHandler(driverController.getAvailableDriversForAssignment)
);
router.get(
  '/available-vehicles-for-assignment',
  permissionMiddleware('vehicle_assign'),
  asyncHandler(driverController.getAvailableVehiclesForAssignment)
);
router.get(
  '/',
  permissionMiddleware('driver_view'),
  listDriversValidator,
  validationMiddleware,
  asyncHandler(driverController.listDrivers)
);
router.post(
  '/',
  permissionMiddleware('driver_create'),
  createDriverValidator,
  validationMiddleware,
  asyncHandler(driverController.createDriver)
);
router.get(
  '/:id',
  permissionMiddleware('driver_view'),
  driverIdParamValidator,
  validationMiddleware,
  asyncHandler(driverController.getDriverById)
);
router.put(
  '/:id',
  permissionMiddleware('driver_update'),
  updateDriverValidator,
  validationMiddleware,
  asyncHandler(driverController.updateDriver)
);
router.delete(
  '/:id',
  permissionMiddleware('driver_delete'),
  driverIdParamValidator,
  validationMiddleware,
  asyncHandler(driverController.deleteDriver)
);
router.patch(
  '/:id/status',
  permissionMiddleware('driver_update'),
  updateDriverStatusValidator,
  validationMiddleware,
  asyncHandler(driverController.updateDriverStatus)
);
router.patch(
  '/:id/availability',
  permissionMiddleware('driver_update'),
  updateDriverAvailabilityValidator,
  validationMiddleware,
  asyncHandler(driverController.updateDriverAvailability)
);
router.patch(
  '/:id/verify',
  permissionMiddleware('driver_verify'),
  verifyDriverValidator,
  validationMiddleware,
  asyncHandler(driverController.verifyDriver)
);
router.post(
  '/:id/assign-vehicle',
  permissionMiddleware('vehicle_assign'),
  assignVehicleToDriverValidator,
  validationMiddleware,
  asyncHandler(driverController.assignVehicleToDriver)
);
router.post(
  '/:id/return-vehicle',
  permissionMiddleware('vehicle_assign'),
  returnAssignedVehicleValidator,
  validationMiddleware,
  asyncHandler(driverController.returnAssignedVehicle)
);
router.get(
  '/:id/vehicle-history',
  permissionMiddleware('vehicle_assign'),
  driverVehicleHistoryValidator,
  validationMiddleware,
  asyncHandler(driverController.getDriverVehicleAssignmentHistory)
);
router.post(
  '/:id/documents',
  permissionMiddleware('driver_update'),
  createDriverDocumentValidator,
  validationMiddleware,
  asyncHandler(driverController.createDriverDocument)
);
router.get(
  '/:id/documents',
  permissionMiddleware('driver_view'),
  driverIdParamValidator,
  validationMiddleware,
  asyncHandler(driverController.listDriverDocuments)
);
module.exports = router;
