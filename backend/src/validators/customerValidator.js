const { body, param, query } = require('express-validator');
const {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS,
  CUSTOMER_ADDRESS_TYPES,
  CUSTOMER_DOCUMENT_TYPES
} = require('../constants/customerConstants');

const uuidParam = (field, label) =>
  param(field).isUUID().withMessage(`${label} must be a valid UUID.`);

const optionalFileRule = (field, label) =>
  body(field)
    .optional()
    .custom((value) => {
      if (!value?.content || !value?.original_name) {
        throw new Error(`${label} must include content and original_name.`);
      }
      return true;
    });

const documentNameRule = body('document_name')
  .optional({ nullable: true })
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('Document name must be between 1 and 100 characters.');

const createCustomerValidator = [
  body('customer_code')
    .optional()
    .trim()
    .matches(/^[A-Z0-9-_/]+$/i)
    .withMessage(
      'Customer code may contain letters, numbers, hyphens, underscores, and slashes.'
    )
    .isLength({ min: 3, max: 50 })
    .withMessage('Customer code must be between 3 and 50 characters.'),
  body('customer_type')
    .notEmpty()
    .withMessage('Customer type is required.')
    .isIn(CUSTOMER_TYPES)
    .withMessage(`Customer type must be one of: ${CUSTOMER_TYPES.join(', ')}.`),
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters.'),
  body('contact_person')
    .trim()
    .notEmpty()
    .withMessage('Contact person is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Contact person must be between 2 and 150 characters.'),
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
    .matches(/^[0-9+\-\s]{7,20}$/)
    .withMessage('Phone number must be valid.'),
  body('alternate_phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s]{7,20}$/)
    .withMessage('Alternate phone number must be valid.'),
  body('gst_number')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('GST number must be at most 30 characters.'),
  body('pan_number')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('PAN number must be at most 20 characters.'),
  body('verification_status')
    .optional()
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    )
];

const updateCustomerValidator = [
  uuidParam('id', 'Customer ID'),
  body('customer_code')
    .optional()
    .trim()
    .matches(/^[A-Z0-9-_/]+$/i)
    .withMessage(
      'Customer code may contain letters, numbers, hyphens, underscores, and slashes.'
    )
    .isLength({ min: 3, max: 50 })
    .withMessage('Customer code must be between 3 and 50 characters.'),
  body('customer_type')
    .optional()
    .isIn(CUSTOMER_TYPES)
    .withMessage(`Customer type must be one of: ${CUSTOMER_TYPES.join(', ')}.`),
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters.'),
  body('contact_person')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Contact person must be between 2 and 150 characters.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s]{7,20}$/)
    .withMessage('Phone number must be valid.'),
  body('alternate_phone')
    .optional()
    .matches(/^[0-9+\-\s]{7,20}$/)
    .withMessage('Alternate phone number must be valid.'),
  body('gst_number')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('GST number must be at most 30 characters.'),
  body('pan_number')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('PAN number must be at most 20 characters.'),
  body('status')
    .optional()
    .isIn(CUSTOMER_STATUS)
    .withMessage(`Status must be one of: ${CUSTOMER_STATUS.join(', ')}.`),
  body('verification_status')
    .optional()
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    )
];

const listCustomersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
  query('customer_type')
    .optional()
    .isIn(CUSTOMER_TYPES)
    .withMessage(`Customer type must be one of: ${CUSTOMER_TYPES.join(', ')}.`),
  query('status')
    .optional()
    .isIn(CUSTOMER_STATUS)
    .withMessage(`Status must be one of: ${CUSTOMER_STATUS.join(', ')}.`),
  query('verification_status')
    .optional()
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    )
];

const customerIdParamValidator = [uuidParam('id', 'Customer ID')];
const customerAddressIdParamValidator = [uuidParam('id', 'Customer address ID')];
const customerDocumentIdParamValidator = [uuidParam('id', 'Customer document ID')];
const customerNoteIdParamValidator = [uuidParam('id', 'Customer note ID')];

const updateCustomerStatusValidator = [
  ...customerIdParamValidator,
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(CUSTOMER_STATUS)
    .withMessage(`Status must be one of: ${CUSTOMER_STATUS.join(', ')}.`)
];

const verifyCustomerValidator = [
  ...customerIdParamValidator,
  body('verification_status')
    .notEmpty()
    .withMessage('Verification status is required.')
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    )
];

const createCustomerAddressValidator = [
  ...customerIdParamValidator,
  body('address_type')
    .notEmpty()
    .withMessage('Address type is required.')
    .isIn(CUSTOMER_ADDRESS_TYPES)
    .withMessage(`Address type must be one of: ${CUSTOMER_ADDRESS_TYPES.join(', ')}.`),
  body('address_line_1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required.')
    .isLength({ max: 255 })
    .withMessage('Address line 1 must be at most 255 characters.'),
  body('address_line_2')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must be at most 255 characters.'),
  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Landmark must be at most 255 characters.'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required.')
    .isLength({ max: 100 })
    .withMessage('City must be at most 100 characters.'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required.')
    .isLength({ max: 100 })
    .withMessage('State must be at most 100 characters.'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required.')
    .isLength({ max: 100 })
    .withMessage('Country must be at most 100 characters.'),
  body('pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required.')
    .isLength({ max: 20 })
    .withMessage('Pincode must be at most 20 characters.'),
  body('latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate.'),
  body('longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate.'),
  body('is_default').optional().isBoolean().withMessage('is_default must be true or false.')
];

const updateCustomerAddressValidator = [
  ...customerAddressIdParamValidator,
  body('address_type')
    .optional()
    .isIn(CUSTOMER_ADDRESS_TYPES)
    .withMessage(`Address type must be one of: ${CUSTOMER_ADDRESS_TYPES.join(', ')}.`),
  body('address_line_1')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Address line 1 must be between 1 and 255 characters.'),
  body('address_line_2')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must be at most 255 characters.'),
  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Landmark must be at most 255 characters.'),
  body('city').optional().trim().isLength({ min: 1, max: 100 }).withMessage('City must be between 1 and 100 characters.'),
  body('state').optional().trim().isLength({ min: 1, max: 100 }).withMessage('State must be between 1 and 100 characters.'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters.'),
  body('pincode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Pincode must be between 1 and 20 characters.'),
  body('latitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid coordinate.'),
  body('longitude')
    .optional({ values: 'falsy' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid coordinate.'),
  body('is_default').optional().isBoolean().withMessage('is_default must be true or false.')
];

const createCustomerDocumentValidator = [
  ...customerIdParamValidator,
  body('document_type')
    .notEmpty()
    .withMessage('Document type is required.')
    .isIn(CUSTOMER_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${CUSTOMER_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number')
    .trim()
    .notEmpty()
    .withMessage('Document number is required.')
    .isLength({ max: 100 })
    .withMessage('Document number must be at most 100 characters.'),
  documentNameRule,
  body('document_name').custom((value, { req }) => {
    if (req.body.document_type === 'OTHER' && !String(value || '').trim()) {
      throw new Error('Document name is required when document type is OTHER.');
    }
    return true;
  }),
  body('verification_status')
    .optional()
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    ),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must be at most 1000 characters.'),
  body('document_file').custom((value) => {
    if (!value?.content || !value?.original_name) {
      throw new Error('Document file must include content and original_name.');
    }
    return true;
  })
];

const updateCustomerDocumentValidator = [
  ...customerDocumentIdParamValidator,
  body('document_type')
    .optional()
    .isIn(CUSTOMER_DOCUMENT_TYPES)
    .withMessage(`Document type must be one of: ${CUSTOMER_DOCUMENT_TYPES.join(', ')}.`),
  body('document_number')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Document number must be between 1 and 100 characters.'),
  documentNameRule,
  body('document_name').custom((value, { req }) => {
    const documentType = req.body.document_type;

    if (documentType === 'OTHER' && !String(value || '').trim()) {
      throw new Error('Document name is required when document type is OTHER.');
    }

    if (documentType && documentType !== 'OTHER' && String(value || '').trim()) {
      throw new Error('Document name can only be provided when document type is OTHER.');
    }

    return true;
  }),
  body('verification_status')
    .optional()
    .isIn(CUSTOMER_VERIFICATION_STATUS)
    .withMessage(
      `Verification status must be one of: ${CUSTOMER_VERIFICATION_STATUS.join(', ')}.`
    ),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must be at most 1000 characters.'),
  optionalFileRule('document_file', 'Document file')
];

const createCustomerNoteValidator = [
  ...customerIdParamValidator,
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note is required.')
    .isLength({ max: 2000 })
    .withMessage('Note must be at most 2000 characters.')
];

module.exports = {
  listCustomersValidator,
  createCustomerValidator,
  updateCustomerValidator,
  customerIdParamValidator,
  customerAddressIdParamValidator,
  customerDocumentIdParamValidator,
  customerNoteIdParamValidator,
  updateCustomerStatusValidator,
  verifyCustomerValidator,
  createCustomerAddressValidator,
  updateCustomerAddressValidator,
  createCustomerDocumentValidator,
  updateCustomerDocumentValidator,
  createCustomerNoteValidator
};
