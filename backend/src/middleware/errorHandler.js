const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  const errors = err.errors || [];

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return ApiResponse.error(res, message, errors, statusCode);
};

module.exports = errorHandler;
