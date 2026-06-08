const express = require('express');
const customerAuthController = require('../controllers/customerAuthController');
const validationMiddleware = require('../middleware/validationMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  sendOtpValidator,
  verifyOtpValidator
} = require('../validators/customerAuthValidator');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  registerValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.register)
);
router.post(
  '/login',
  authLimiter,
  loginValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.login)
);
router.post(
  '/logout',
  refreshTokenValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.logout)
);
router.post(
  '/refresh-token',
  refreshTokenValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.refreshToken)
);
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.forgotPassword)
);
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.resetPassword)
);
router.post(
  '/send-otp',
  authLimiter,
  sendOtpValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.sendOtp)
);
router.post(
  '/verify-otp',
  authLimiter,
  verifyOtpValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.verifyOtp)
);
router.post(
  '/resend-otp',
  authLimiter,
  sendOtpValidator,
  validationMiddleware,
  asyncHandler(customerAuthController.resendOtp)
);

module.exports = router;
