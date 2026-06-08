const driverService = require('../services/driverService');
const ApiResponse = require('../utils/ApiResponse');

const listDrivers = async (req, res) => {
  const data = await driverService.listDrivers(req.query);
  return ApiResponse.success(res, 'Drivers fetched successfully.', data);
};

const getDriverById = async (req, res) => {
  const driver = await driverService.getDriverById(req.params.id);
  return ApiResponse.success(res, 'Driver fetched successfully.', { driver });
};

const createDriver = async (req, res) => {
  const driver = await driverService.createDriver(req.body);
  return ApiResponse.success(res, 'Driver created successfully.', { driver }, 201);
};

const updateDriver = async (req, res) => {
  const driver = await driverService.updateDriver(req.params.id, req.body);
  return ApiResponse.success(res, 'Driver updated successfully.', { driver });
};

const deleteDriver = async (req, res) => {
  await driverService.deleteDriver(req.params.id);
  return ApiResponse.success(res, 'Driver deleted successfully.');
};

const updateDriverStatus = async (req, res) => {
  const driver = await driverService.updateDriverStatus(req.params.id, req.body.status);
  return ApiResponse.success(res, 'Driver status updated successfully.', { driver });
};

const updateDriverAvailability = async (req, res) => {
  const driver = await driverService.updateDriverAvailability(
    req.params.id,
    req.body.availability_status
  );
  return ApiResponse.success(res, 'Driver availability updated successfully.', { driver });
};

const verifyDriver = async (req, res) => {
  const driver = await driverService.verifyDriver(req.params.id, req.body.verification_status);
  return ApiResponse.success(res, 'Driver verification updated successfully.', { driver });
};

const createDriverDocument = async (req, res) => {
  const document = await driverService.createDriverDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Driver document uploaded successfully.', { document }, 201);
};

const listDriverDocuments = async (req, res) => {
  const documents = await driverService.listDriverDocuments(req.params.id);
  return ApiResponse.success(res, 'Driver documents fetched successfully.', { documents });
};

const updateDriverDocument = async (req, res) => {
  const document = await driverService.updateDriverDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Driver document updated successfully.', { document });
};

const deleteDriverDocument = async (req, res) => {
  await driverService.deleteDriverDocument(req.params.id);
  return ApiResponse.success(res, 'Driver document deleted successfully.');
};

const getDriverDashboardStats = async (req, res) => {
  const stats = await driverService.getDriverDashboardStats();
  return ApiResponse.success(res, 'Driver dashboard stats fetched successfully.', { stats });
};

const getAvailableDriversForAssignment = async (req, res) => {
  const drivers = await driverService.getAvailableDriversForAssignment();
  return ApiResponse.success(res, 'Available drivers fetched successfully.', { drivers });
};

const getAvailableVehiclesForAssignment = async (req, res) => {
  const vehicles = await driverService.getAvailableVehiclesForAssignment();
  return ApiResponse.success(res, 'Available vehicles fetched successfully.', { vehicles });
};

const assignVehicleToDriver = async (req, res) => {
  const assignment = await driverService.assignVehicleToDriver(
    req.params.id,
    req.body.vehicle_id,
    req.user
  );
  return ApiResponse.success(res, 'Vehicle assigned successfully.', { assignment }, 201);
};

const returnAssignedVehicle = async (req, res) => {
  const assignment = await driverService.returnAssignedVehicle(req.params.id, req.user);
  return ApiResponse.success(res, 'Vehicle returned successfully.', { assignment });
};

const getDriverVehicleAssignmentHistory = async (req, res) => {
  const history = await driverService.getDriverVehicleAssignmentHistory(req.params.id);
  return ApiResponse.success(res, 'Driver vehicle assignment history fetched successfully.', {
    history
  });
};

module.exports = {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  updateDriverAvailability,
  verifyDriver,
  createDriverDocument,
  listDriverDocuments,
  updateDriverDocument,
  deleteDriverDocument,
  getDriverDashboardStats,
  getAvailableDriversForAssignment,
  getAvailableVehiclesForAssignment,
  assignVehicleToDriver,
  returnAssignedVehicle,
  getDriverVehicleAssignmentHistory
};
