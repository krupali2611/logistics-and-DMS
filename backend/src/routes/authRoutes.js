const express = require('express');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validationMiddleware');
const {
  loginValidator,
  refreshValidator,
  logoutValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, loginValidator, validationMiddleware, asyncHandler(authController.login));
router.post('/refresh', refreshValidator, validationMiddleware, asyncHandler(authController.refresh));
router.post('/logout', logoutValidator, validationMiddleware, asyncHandler(authController.logout));
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validationMiddleware,
  asyncHandler(authController.forgotPassword)
);
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidator,
  validationMiddleware,
  asyncHandler(authController.resetPassword)
);

module.exports = router;
