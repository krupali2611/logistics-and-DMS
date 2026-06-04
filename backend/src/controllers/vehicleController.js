const vehicleService = require('../services/vehicleService');
const ApiResponse = require('../utils/ApiResponse');

const listVehicleTypes = async (req, res) => {
  const vehicleTypes = await vehicleService.listVehicleTypes(req.query);
  return ApiResponse.success(res, 'Vehicle types fetched successfully.', { vehicleTypes });
};

const getVehicleTypeById = async (req, res) => {
  const vehicleType = await vehicleService.getVehicleTypeById(req.params.id);
  return ApiResponse.success(res, 'Vehicle type fetched successfully.', { vehicleType });
};

const createVehicleType = async (req, res) => {
  const vehicleType = await vehicleService.createVehicleType(req.body);
  return ApiResponse.success(res, 'Vehicle type created successfully.', { vehicleType }, 201);
};

const updateVehicleType = async (req, res) => {
  const vehicleType = await vehicleService.updateVehicleType(req.params.id, req.body);
  return ApiResponse.success(res, 'Vehicle type updated successfully.', { vehicleType });
};

const deleteVehicleType = async (req, res) => {
  await vehicleService.deleteVehicleType(req.params.id);
  return ApiResponse.success(res, 'Vehicle type deleted successfully.');
};

const listVehicles = async (req, res) => {
  const data = await vehicleService.listVehicles(req.query);
  return ApiResponse.success(res, 'Vehicles fetched successfully.', data);
};

const getVehicleById = async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  return ApiResponse.success(res, 'Vehicle fetched successfully.', { vehicle });
};

const createVehicle = async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  return ApiResponse.success(res, 'Vehicle created successfully.', { vehicle }, 201);
};

const updateVehicle = async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  return ApiResponse.success(res, 'Vehicle updated successfully.', { vehicle });
};

const deleteVehicle = async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  return ApiResponse.success(res, 'Vehicle deleted successfully.');
};

const updateVehicleStatus = async (req, res) => {
  const vehicle = await vehicleService.updateVehicleStatus(req.params.id, req.body.status);
  return ApiResponse.success(res, 'Vehicle status updated successfully.', { vehicle });
};

const verifyVehicle = async (req, res) => {
  const vehicle = await vehicleService.verifyVehicle(req.params.id, req.body.verification_status);
  return ApiResponse.success(res, 'Vehicle verification updated successfully.', { vehicle });
};

const updateVehicleAvailability = async (req, res) => {
  const vehicle = await vehicleService.updateVehicleAvailability(
    req.params.id,
    req.body.availability_status
  );
  return ApiResponse.success(res, 'Vehicle availability updated successfully.', { vehicle });
};

const createVehicleDocument = async (req, res) => {
  const document = await vehicleService.createVehicleDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Vehicle document uploaded successfully.', { document }, 201);
};

const listVehicleDocuments = async (req, res) => {
  const documents = await vehicleService.listVehicleDocuments(req.params.id);
  return ApiResponse.success(res, 'Vehicle documents fetched successfully.', { documents });
};

const updateVehicleDocument = async (req, res) => {
  const document = await vehicleService.updateVehicleDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Vehicle document updated successfully.', { document });
};

const deleteVehicleDocument = async (req, res) => {
  await vehicleService.deleteVehicleDocument(req.params.id);
  return ApiResponse.success(res, 'Vehicle document deleted successfully.');
};

const assignVehicle = async (req, res) => {
  const assignment = await vehicleService.assignVehicle(req.body);
  return ApiResponse.success(res, 'Vehicle assigned successfully.', { assignment }, 201);
};

const removeAssignment = async (req, res) => {
  await vehicleService.removeAssignment(req.params.id);
  return ApiResponse.success(res, 'Vehicle assignment removed successfully.');
};

const listAssignments = async (req, res) => {
  const data = await vehicleService.listAssignments(req.query);
  return ApiResponse.success(res, 'Vehicle assignments fetched successfully.', data);
};

const getVehicleDashboardStats = async (req, res) => {
  const stats = await vehicleService.getVehicleDashboardStats();
  return ApiResponse.success(res, 'Vehicle dashboard stats fetched successfully.', { stats });
};

module.exports = {
  listVehicleTypes,
  getVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  verifyVehicle,
  updateVehicleAvailability,
  createVehicleDocument,
  listVehicleDocuments,
  updateVehicleDocument,
  deleteVehicleDocument,
  assignVehicle,
  removeAssignment,
  listAssignments,
  getVehicleDashboardStats
};
