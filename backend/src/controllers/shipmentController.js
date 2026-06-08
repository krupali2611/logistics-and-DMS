const shipmentService = require('../services/shipmentService');
const ApiResponse = require('../utils/ApiResponse');

const listShipments = async (req, res) => {
  const data = await shipmentService.listShipments(req.query);
  return ApiResponse.success(res, 'Shipments fetched successfully.', data);
};

const getShipmentById = async (req, res) => {
  const shipment = await shipmentService.getShipmentById(req.params.id);
  return ApiResponse.success(res, 'Shipment fetched successfully.', { shipment });
};

const createShipment = async (req, res) => {
  const shipment = await shipmentService.createShipment(req.body, req.user.id);
  return ApiResponse.success(res, 'Shipment created successfully.', { shipment }, 201);
};

const updateShipment = async (req, res) => {
  const shipment = await shipmentService.updateShipment(req.params.id, req.body);
  return ApiResponse.success(res, 'Shipment updated successfully.', { shipment });
};

const deleteShipment = async (req, res) => {
  await shipmentService.deleteShipment(req.params.id);
  return ApiResponse.success(res, 'Shipment deleted successfully.');
};

const cancelShipment = async (req, res) => {
  const shipment = await shipmentService.cancelShipment(req.params.id, req.body.remarks, req.user.id);
  return ApiResponse.success(res, 'Shipment cancelled successfully.', { shipment });
};

const updateShipmentStatus = async (req, res) => {
  const shipment = await shipmentService.updateShipmentStatus(
    req.params.id,
    req.body.status,
    req.body.remarks,
    req.user.id
  );
  return ApiResponse.success(res, 'Shipment status updated successfully.', { shipment });
};

const createShipmentPackages = async (req, res) => {
  const packages = await shipmentService.createShipmentPackages(req.params.id, req.body);
  return ApiResponse.success(res, 'Shipment packages created successfully.', { packages }, 201);
};

const listShipmentPackages = async (req, res) => {
  const packages = await shipmentService.listShipmentPackages(req.params.id);
  return ApiResponse.success(res, 'Shipment packages fetched successfully.', { packages });
};

const updateShipmentPackage = async (req, res) => {
  const shipmentPackage = await shipmentService.updateShipmentPackage(req.params.id, req.body);
  return ApiResponse.success(res, 'Shipment package updated successfully.', {
    shipmentPackage
  });
};

const deleteShipmentPackage = async (req, res) => {
  await shipmentService.deleteShipmentPackage(req.params.id);
  return ApiResponse.success(res, 'Shipment package deleted successfully.');
};

const createShipmentAttachment = async (req, res) => {
  const attachment = await shipmentService.createShipmentAttachment(req.params.id, req.body, req.user.id);
  return ApiResponse.success(res, 'Shipment attachment uploaded successfully.', { attachment }, 201);
};

const listShipmentAttachments = async (req, res) => {
  const attachments = await shipmentService.listShipmentAttachments(req.params.id);
  return ApiResponse.success(res, 'Shipment attachments fetched successfully.', { attachments });
};

const deleteShipmentAttachment = async (req, res) => {
  await shipmentService.deleteShipmentAttachment(req.params.id);
  return ApiResponse.success(res, 'Shipment attachment deleted successfully.');
};

const getShipmentDashboardStats = async (req, res) => {
  const stats = await shipmentService.getShipmentDashboardStats();
  return ApiResponse.success(res, 'Shipment dashboard stats fetched successfully.', { stats });
};

module.exports = {
  listShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  cancelShipment,
  updateShipmentStatus,
  createShipmentPackages,
  listShipmentPackages,
  updateShipmentPackage,
  deleteShipmentPackage,
  createShipmentAttachment,
  listShipmentAttachments,
  deleteShipmentAttachment,
  getShipmentDashboardStats
};
