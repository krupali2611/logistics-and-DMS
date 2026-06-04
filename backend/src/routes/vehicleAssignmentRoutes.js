const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listAssignmentsValidator,
  createAssignmentValidator,
  assignmentIdParamValidator
} = require('../validators/vehicleValidator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  permissionMiddleware('vehicle_assign'),
  listAssignmentsValidator,
  validationMiddleware,
  asyncHandler(vehicleController.listAssignments)
);
router.post(
  '/',
  permissionMiddleware('vehicle_assign'),
  createAssignmentValidator,
  validationMiddleware,
  asyncHandler(vehicleController.assignVehicle)
);
router.delete(
  '/:id',
  permissionMiddleware('vehicle_assign'),
  assignmentIdParamValidator,
  validationMiddleware,
  asyncHandler(vehicleController.removeAssignment)
);

module.exports = router;
