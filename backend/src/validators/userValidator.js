const { body, param } = require('express-validator');

const nameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ min: 2, max: 100 })
    .withMessage(`${label} must be between 2 and 100 characters.`);

const phoneRule = body('phone')
  .optional({ values: 'falsy' })
  .trim()
  .matches(/^[0-9+\-\s]{7,20}$/)
  .withMessage('Phone number must be valid.');

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

const userIdParamValidator = [param('id').isUUID().withMessage('User ID must be a valid UUID.')];

const createUserValidator = [
  nameRule('first_name', 'First name'),
  nameRule('last_name', 'Last name'),
  emailRule,
  phoneRule,
  passwordRule,
  body('role_ids')
    .optional()
    .isArray()
    .withMessage('role_ids must be an array of role UUIDs.')
];

const updateUserValidator = [
  ...userIdParamValidator,
  body('first_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters.'),
  body('last_name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  phoneRule,
  body('status').optional().isBoolean().withMessage('Status must be true or false.'),
  body('role_ids').optional().isArray().withMessage('role_ids must be an array of role UUIDs.')
];

const updateProfileValidator = [
  nameRule('first_name', 'First name'),
  nameRule('last_name', 'Last name'),
  phoneRule
];

const changePasswordValidator = [
  body('current_password').notEmpty().withMessage('Current password is required.'),
  body('new_password')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.')
];

module.exports = {
  userIdParamValidator,
  createUserValidator,
  updateUserValidator,
  updateProfileValidator,
  changePasswordValidator
};
