const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

const login = async (req, res) => {
  const data = await authService.login(req.body);
  return ApiResponse.success(res, 'Login successful.', data);
};

const refresh = async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  return ApiResponse.success(res, 'Access token refreshed successfully.', data);
};

const logout = async (req, res) => {
  await authService.logout(req.body.refreshToken);
  return ApiResponse.success(res, 'Logout successful.');
};

const forgotPassword = async (req, res) => {
  const resetPayload = await authService.forgotPassword(req.body.email);
  const data =
    process.env.NODE_ENV !== 'production' && resetPayload
      ? { resetToken: resetPayload.resetToken, expiresIn: resetPayload.expiresIn }
      : {};

  return ApiResponse.success(
    res,
    'If the email exists, password reset instructions have been generated.',
    data
  );
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.body);
  return ApiResponse.success(res, 'Password reset successful.');
};

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword
};
