const userService = require('../services/userService');
const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

const listUsers = async (req, res) => {
  const users = await userService.listUsers();
  return ApiResponse.success(res, 'Users fetched successfully.', { users });
};

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return ApiResponse.success(res, 'User created successfully.', { user }, 201);
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return ApiResponse.success(res, 'User updated successfully.', { user });
};

const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  return ApiResponse.success(res, 'User deleted successfully.');
};

const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  const authPayload = await authService.buildAuthPayload(req.user.id);

  return ApiResponse.success(res, 'Profile fetched successfully.', {
    user,
    roles: authPayload.roles,
    permissions: authPayload.permissions
  });
};

const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, 'Profile updated successfully.', { user });
};

const changePassword = async (req, res) => {
  await userService.changePassword(
    req.user.id,
    req.body.current_password,
    req.body.new_password
  );

  return ApiResponse.success(res, 'Password changed successfully. Please log in again.');
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword
};
