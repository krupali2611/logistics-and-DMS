class ApiResponse {
  static success(res, message = 'Request completed successfully.', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Something went wrong.', errors = [], statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
}

module.exports = ApiResponse;
