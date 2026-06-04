const { body } = require('express-validator');

const emailRule = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required.')
  .isEmail()
  .withMessage('Please provide a valid email.')
  .normalizeEmail();

const passwordRule = body('password')
  .notEmpty()
  .withMessage('Password is required.')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long.');

const loginValidator = [emailRule, body('password').notEmpty().withMessage('Password is required.')];

const refreshValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.')
];

const logoutValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required.')
];

const forgotPasswordValidator = [emailRule];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  passwordRule
];

module.exports = {
  loginValidator,
  refreshValidator,
  logoutValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
