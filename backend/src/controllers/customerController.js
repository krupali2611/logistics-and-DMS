const customerService = require('../services/customerService');
const ApiResponse = require('../utils/ApiResponse');

const listCustomers = async (req, res) => {
  const data = await customerService.listCustomers(req.query);
  return ApiResponse.success(res, 'Customers fetched successfully.', data);
};

const getCustomerById = async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  return ApiResponse.success(res, 'Customer fetched successfully.', { customer });
};

const createCustomer = async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  return ApiResponse.success(res, 'Customer created successfully.', { customer }, 201);
};

const updateCustomer = async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  return ApiResponse.success(res, 'Customer updated successfully.', { customer });
};

const deleteCustomer = async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  return ApiResponse.success(res, 'Customer deleted successfully.');
};

const updateCustomerStatus = async (req, res) => {
  const customer = await customerService.updateCustomerStatus(req.params.id, req.body.status);
  return ApiResponse.success(res, 'Customer status updated successfully.', { customer });
};

const verifyCustomer = async (req, res) => {
  const customer = await customerService.verifyCustomer(
    req.params.id,
    req.body.verification_status
  );
  return ApiResponse.success(res, 'Customer verification updated successfully.', { customer });
};

const createCustomerAddress = async (req, res) => {
  const address = await customerService.createCustomerAddress(req.params.id, req.body);
  return ApiResponse.success(res, 'Customer address created successfully.', { address }, 201);
};

const listCustomerAddresses = async (req, res) => {
  const addresses = await customerService.listCustomerAddresses(req.params.id);
  return ApiResponse.success(res, 'Customer addresses fetched successfully.', { addresses });
};

const updateCustomerAddress = async (req, res) => {
  const address = await customerService.updateCustomerAddress(req.params.id, req.body);
  return ApiResponse.success(res, 'Customer address updated successfully.', { address });
};

const deleteCustomerAddress = async (req, res) => {
  await customerService.deleteCustomerAddress(req.params.id);
  return ApiResponse.success(res, 'Customer address deleted successfully.');
};

const createCustomerDocument = async (req, res) => {
  const document = await customerService.createCustomerDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Customer document uploaded successfully.', { document }, 201);
};

const listCustomerDocuments = async (req, res) => {
  const documents = await customerService.listCustomerDocuments(req.params.id);
  return ApiResponse.success(res, 'Customer documents fetched successfully.', { documents });
};

const updateCustomerDocument = async (req, res) => {
  const document = await customerService.updateCustomerDocument(req.params.id, req.body);
  return ApiResponse.success(res, 'Customer document updated successfully.', { document });
};

const deleteCustomerDocument = async (req, res) => {
  await customerService.deleteCustomerDocument(req.params.id);
  return ApiResponse.success(res, 'Customer document deleted successfully.');
};

const createCustomerNote = async (req, res) => {
  const note = await customerService.createCustomerNote(req.params.id, req.body.note, req.user.id);
  return ApiResponse.success(res, 'Customer note added successfully.', { note }, 201);
};

const listCustomerNotes = async (req, res) => {
  const notes = await customerService.listCustomerNotes(req.params.id);
  return ApiResponse.success(res, 'Customer notes fetched successfully.', { notes });
};

const deleteCustomerNote = async (req, res) => {
  await customerService.deleteCustomerNote(req.params.id);
  return ApiResponse.success(res, 'Customer note deleted successfully.');
};

const getCustomerDashboardStats = async (req, res) => {
  const stats = await customerService.getCustomerDashboardStats();
  return ApiResponse.success(res, 'Customer dashboard stats fetched successfully.', { stats });
};

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  verifyCustomer,
  createCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
  deleteCustomerAddress,
  createCustomerDocument,
  listCustomerDocuments,
  updateCustomerDocument,
  deleteCustomerDocument,
  createCustomerNote,
  listCustomerNotes,
  deleteCustomerNote,
  getCustomerDashboardStats
};
