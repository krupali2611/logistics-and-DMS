const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return ApiResponse.error(
      res,
      'Validation failed.',
      errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      })),
      422
    );
  }

  next();
};

module.exports = validationMiddleware;
