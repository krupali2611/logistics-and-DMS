const { body } = require('express-validator');
const { CUSTOMER_OTP_TYPES } = require('../constants/customerAuthConstants');

const PHONE_REGEX = /^[0-9+\-\s]{7,20}$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const emailRule = body('email')
  .optional()
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email.')
  .normalizeEmail();

const phoneRule = body('phone')
  .optional()
  .trim()
  .matches(PHONE_REGEX)
  .withMessage('Please provide a valid phone number.');

const passwordRule = body('password')
  .trim()
  .notEmpty()
  .withMessage('Password is required.')
  .matches(STRONG_PASSWORD_REGEX)
  .withMessage(
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
  );

const otpReferenceRule = body().custom((value, { req }) => {
  if (!req.body.customer_user_id && !req.body.email && !req.body.phone) {
    throw new Error('Provide customer_user_id, email, or phone.');
  }

  return true;
});

const registerValidator = [
  body('customer_id').optional().isUUID().withMessage('Customer ID must be a valid UUID.'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters.'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required.')
    .matches(PHONE_REGEX)
    .withMessage('Please provide a valid phone number.'),
  passwordRule,
  body('confirm_password')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password and confirm password must match.')
];

const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required.'),
  body('password').trim().notEmpty().withMessage('Password is required.')
];

const refreshTokenValidator = [
  body('refreshToken').trim().notEmpty().withMessage('Refresh token is required.')
];

const forgotPasswordValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required.')
];

const resetPasswordValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required.'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required.')
    .isLength({ min: 4, max: 8 })
    .withMessage('OTP must be between 4 and 8 characters.'),
  passwordRule,
  body('confirm_password')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password and confirm password must match.')
];

const sendOtpValidator = [
  body('customer_user_id').optional().isUUID().withMessage('Customer user ID must be a valid UUID.'),
  emailRule,
  phoneRule,
  body('type')
    .trim()
    .notEmpty()
    .withMessage('OTP type is required.')
    .isIn(CUSTOMER_OTP_TYPES)
    .withMessage(`OTP type must be one of: ${CUSTOMER_OTP_TYPES.join(', ')}.`),
  otpReferenceRule
];

const verifyOtpValidator = [
  body('customer_user_id').optional().isUUID().withMessage('Customer user ID must be a valid UUID.'),
  emailRule,
  phoneRule,
  body('type')
    .trim()
    .notEmpty()
    .withMessage('OTP type is required.')
    .isIn(CUSTOMER_OTP_TYPES)
    .withMessage(`OTP type must be one of: ${CUSTOMER_OTP_TYPES.join(', ')}.`),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required.')
    .isLength({ min: 4, max: 8 })
    .withMessage('OTP must be between 4 and 8 characters.'),
  otpReferenceRule
];

const updateCustomerProfileValidator = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters.'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('phone').optional().trim().matches(PHONE_REGEX).withMessage('Please provide a valid phone number.'),
  body('profile_image')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Profile image must be at most 500 characters.')
];

const changeCustomerPasswordValidator = [
  body('current_password')
    .trim()
    .notEmpty()
    .withMessage('Current password is required.'),
  body('new_password')
    .trim()
    .notEmpty()
    .withMessage('New password is required.')
    .matches(STRONG_PASSWORD_REGEX)
    .withMessage(
      'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    ),
  body('confirm_password')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => value === req.body.new_password)
    .withMessage('New password and confirm password must match.')
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  sendOtpValidator,
  verifyOtpValidator,
  updateCustomerProfileValidator,
  changeCustomerPasswordValidator
};
