const shipmentService = require('../services/shipmentService');
const {
  toShipmentListDto,
  toShipmentDetailDto,
  toShipmentTrackingDto
} = require('../dtos/shipmentDto');
const ApiResponse = require('../utils/ApiResponse');

const listShipments = async (req, res) => {
  const data = await shipmentService.listShipments(req.query, req.user);
  return ApiResponse.success(res, 'Shipments fetched successfully.', {
    records: data.records.map(toShipmentListDto),
    pagination: data.pagination
  });
};

const listMyShipments = async (req, res) => {
  const data = await shipmentService.listMyShipments(req.query, req.user);
  return ApiResponse.success(res, 'My shipments fetched successfully.', {
    records: data.records.map(toShipmentListDto),
    pagination: data.pagination
  });
};

const getShipmentById = async (req, res) => {
  const shipment = await shipmentService.getShipmentById(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment fetched successfully.', {
    shipment: toShipmentDetailDto(shipment)
  });
};

const getMyShipmentById = async (req, res) => {
  const shipment = await shipmentService.getMyShipmentById(req.params.id, req.user);
  return ApiResponse.success(res, 'My shipment fetched successfully.', {
    shipment: toShipmentDetailDto(shipment)
  });
};

const trackShipment = async (req, res) => {
  const tracking = await shipmentService.trackShipment(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment tracking fetched successfully.', {
    tracking: toShipmentTrackingDto(tracking)
  });
};

const previewShipmentRoute = async (req, res) => {
  const route = await shipmentService.previewShipmentRoute(req.body);
  return ApiResponse.success(res, 'Shipment route preview calculated successfully.', {
    route
  });
};

const createShipment = async (req, res) => {
  const shipment = await shipmentService.createShipment(req.body, req.user);
  return ApiResponse.success(res, 'Shipment created successfully.', {
    shipment: toShipmentDetailDto(shipment)
  }, 201);
};

const updateShipment = async (req, res) => {
  const shipment = await shipmentService.updateShipment(req.params.id, req.body, req.user);
  return ApiResponse.success(res, 'Shipment updated successfully.', {
    shipment: toShipmentDetailDto(shipment)
  });
};

const cancelShipment = async (req, res) => {
  const shipment = await shipmentService.cancelShipment(
    req.params.id,
    req.body.cancellation_reason ?? req.body.remarks,
    req.user
  );
  return ApiResponse.success(res, 'Shipment cancelled successfully.', {
    shipment: toShipmentDetailDto(shipment)
  });
};

const updateShipmentStatus = async (req, res) => {
  const shipment = await shipmentService.updateShipmentStatus(
    req.params.id,
    req.body.status,
    req.body.remarks,
    req.user
  );
  return ApiResponse.success(res, 'Shipment status updated successfully.', {
    shipment: toShipmentDetailDto(shipment)
  });
};

const createShipmentPackages = async (req, res) => {
  const packages = await shipmentService.createShipmentPackages(req.params.id, req.body, req.user);
  return ApiResponse.success(res, 'Shipment packages created successfully.', { packages }, 201);
};

const listShipmentPackages = async (req, res) => {
  const packages = await shipmentService.listShipmentPackages(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment packages fetched successfully.', { packages });
};

const updateShipmentPackage = async (req, res) => {
  const shipmentPackage = await shipmentService.updateShipmentPackage(req.params.id, req.body, req.user);
  return ApiResponse.success(res, 'Shipment package updated successfully.', {
    shipmentPackage
  });
};

const deleteShipmentPackage = async (req, res) => {
  await shipmentService.deleteShipmentPackage(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment package deleted successfully.');
};

const createShipmentAttachment = async (req, res) => {
  const attachment = await shipmentService.createShipmentAttachment(req.params.id, req.body, req.user);
  return ApiResponse.success(res, 'Shipment attachment uploaded successfully.', { attachment }, 201);
};

const listShipmentAttachments = async (req, res) => {
  const attachments = await shipmentService.listShipmentAttachments(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment attachments fetched successfully.', { attachments });
};

const deleteShipmentAttachment = async (req, res) => {
  await shipmentService.deleteShipmentAttachment(req.params.id, req.user);
  return ApiResponse.success(res, 'Shipment attachment deleted successfully.');
};

const getShipmentDashboardStats = async (req, res) => {
  const stats = await shipmentService.getShipmentDashboardStats(req.user);
  return ApiResponse.success(res, 'Shipment dashboard stats fetched successfully.', { stats });
};

module.exports = {
  listShipments,
  listMyShipments,
  getShipmentById,
  getMyShipmentById,
  trackShipment,
  previewShipmentRoute,
  createShipment,
  updateShipment,
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
