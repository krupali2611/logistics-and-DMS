const customerAuthService = require('../services/customerAuthService');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res) => {
  const data = await customerAuthService.register(req.body);
  return ApiResponse.success(res, data.message, data, 201);
};

const login = async (req, res) => {
  const data = await customerAuthService.login(req.body);
  return ApiResponse.success(res, 'Customer login successful.', data);
};

const logout = async (req, res) => {
  await customerAuthService.logout(req.body.refreshToken);
  return ApiResponse.success(res, 'Customer logout successful.');
};

const refreshToken = async (req, res) => {
  const data = await customerAuthService.refreshToken(req.body.refreshToken);
  return ApiResponse.success(res, 'Customer access token refreshed successfully.', data);
};

const forgotPassword = async (req, res) => {
  const data = await customerAuthService.forgotPassword(req.body);
  return ApiResponse.success(
    res,
    'If the account exists, password reset instructions have been generated.',
    data
  );
};

const resetPassword = async (req, res) => {
  await customerAuthService.resetPassword(req.body);
  return ApiResponse.success(res, 'Customer password reset successful.');
};

const sendOtp = async (req, res) => {
  const data = await customerAuthService.sendOtp(req.body);
  return ApiResponse.success(res, 'OTP sent successfully.', data);
};

const resendOtp = async (req, res) => {
  const data = await customerAuthService.resendOtp(req.body);
  return ApiResponse.success(res, 'OTP resent successfully.', data);
};

const verifyOtp = async (req, res) => {
  const data = await customerAuthService.verifyOtp(req.body);
  return ApiResponse.success(res, 'OTP verified successfully.', data);
};

const getProfile = async (req, res) => {
  const data = await customerAuthService.getCustomerProfile(req.customerUser.id);
  return ApiResponse.success(res, 'Customer profile fetched successfully.', data);
};

const updateProfile = async (req, res) => {
  const data = await customerAuthService.updateCustomerProfile(req.customerUser.id, req.body);
  return ApiResponse.success(res, 'Customer profile updated successfully.', data);
};

const changePassword = async (req, res) => {
  await customerAuthService.changePassword(
    req.customerUser.id,
    req.body.current_password,
    req.body.new_password
  );
  return ApiResponse.success(res, 'Customer password changed successfully.');
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  sendOtp,
  resendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  changePassword
};
