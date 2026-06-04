const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  userIdParamValidator,
  createUserValidator,
  updateUserValidator,
  updateProfileValidator,
  changePasswordValidator
} = require('../validators/userValidator');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', asyncHandler(userController.getProfile));
router.put('/profile', updateProfileValidator, validationMiddleware, asyncHandler(userController.updateProfile));
router.put(
  '/change-password',
  changePasswordValidator,
  validationMiddleware,
  asyncHandler(userController.changePassword)
);

router.get('/', permissionMiddleware('user_view'), asyncHandler(userController.listUsers));
router.post('/', permissionMiddleware('user_create'), createUserValidator, validationMiddleware, asyncHandler(userController.createUser));
router.put('/:id', permissionMiddleware('user_update'), updateUserValidator, validationMiddleware, asyncHandler(userController.updateUser));
router.delete('/:id', permissionMiddleware('user_delete'), userIdParamValidator, validationMiddleware, asyncHandler(userController.deleteUser));

module.exports = router;
