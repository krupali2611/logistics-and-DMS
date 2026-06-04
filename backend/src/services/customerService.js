const { Op, col, fn, where } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storage/storageService');
const {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS,
  CUSTOMER_ADDRESS_TYPES,
  CUSTOMER_DOCUMENT_TYPES
} = require('../constants/customerConstants');

const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const buildPagination = ({ page, limit, totalRecords }) => ({
  page,
  limit,
  totalRecords,
  totalPages: Math.ceil(totalRecords / limit) || 1
});

const normalizeEmail = (email) => (email ? email.toLowerCase() : email);
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const toBoolean = (value) => value === true || value === 'true';

const buildCustomerFilters = ({ search, customer_type, status, verification_status }) => {
  const filters = {};

  if (customer_type) {
    filters.customer_type = customer_type;
  }

  if (status) {
    filters.status = status;
  }

  if (verification_status) {
    filters.verification_status = verification_status;
  }

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    filters[Op.or] = [
      { customer_code: { [Op.iLike]: searchTerm } },
      { company_name: { [Op.iLike]: searchTerm } },
      { contact_person: { [Op.iLike]: searchTerm } },
      { phone: { [Op.iLike]: searchTerm } },
      { email: { [Op.iLike]: searchTerm } },
      where(fn('concat', col('company_name'), ' ', col('contact_person')), {
        [Op.iLike]: searchTerm
      })
    ];
  }

  return filters;
};

const getCustomerById = async (id) => {
  const customer = await db.Customer.findByPk(id, {
    include: [
      {
        model: db.CustomerAddress,
        as: 'addresses'
      },
      {
        model: db.CustomerDocument,
        as: 'documents'
      },
      {
        model: db.CustomerNote,
        as: 'notes',
        include: [
          {
            model: db.User,
            as: 'createdBy',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ]
      }
    ],
    order: [
      [{ model: db.CustomerAddress, as: 'addresses' }, 'is_default', 'DESC'],
      [{ model: db.CustomerAddress, as: 'addresses' }, 'created_at', 'DESC'],
      [{ model: db.CustomerDocument, as: 'documents' }, 'created_at', 'DESC'],
      [{ model: db.CustomerNote, as: 'notes' }, 'created_at', 'DESC']
    ]
  });

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  return customer;
};

const assertUniqueCustomerFields = async ({
  customer_code,
  email,
  phone,
  excludeId = null
}) => {
  const orConditions = [];
  const normalizedEmail = normalizeEmail(email);

  if (customer_code) {
    orConditions.push({ customer_code });
  }

  if (normalizedEmail) {
    orConditions.push({ email: normalizedEmail });
  }

  if (phone) {
    orConditions.push({ phone });
  }

  if (orConditions.length === 0) {
    return;
  }

  const existingCustomer = await db.Customer.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: orConditions },
        excludeId ? { id: { [Op.ne]: excludeId } } : {}
      ]
    }
  });

  if (!existingCustomer) {
    return;
  }

  if (customer_code && existingCustomer.customer_code === customer_code) {
    throw new AppError('Customer code already exists.', 409);
  }

  if (normalizedEmail && existingCustomer.email === normalizedEmail) {
    throw new AppError('Customer email already exists.', 409);
  }

  if (phone && existingCustomer.phone === phone) {
    throw new AppError('Customer phone already exists.', 409);
  }
};

const generateCustomerCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const randomSegment = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `CUS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSegment}`;
    const existing = await db.Customer.findOne({
      where: { customer_code: code },
      attributes: ['id']
    });

    if (!existing) {
      return code;
    }
  }

  throw new AppError('Unable to generate a unique customer code. Please try again.', 500);
};

const listCustomers = async (query) => {
  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 10), 100);
  const offset = (page - 1) * limit;
  const whereClause = buildCustomerFilters(query);

  const { rows, count } = await db.Customer.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: db.CustomerAddress,
        as: 'addresses',
        attributes: ['id', 'address_type', 'is_default']
      },
      {
        model: db.CustomerDocument,
        as: 'documents',
        attributes: ['id', 'document_type', 'verification_status']
      }
    ],
    order: [['created_at', 'DESC']],
    distinct: true
  });

  return {
    records: rows,
    pagination: buildPagination({ page, limit, totalRecords: count })
  };
};

const createCustomer = async (payload) => {
  const customerCode = payload.customer_code || (await generateCustomerCode());
  const normalizedEmail = normalizeEmail(payload.email);

  await assertUniqueCustomerFields({
    customer_code: customerCode,
    email: normalizedEmail,
    phone: payload.phone
  });

  const customer = await db.Customer.create({
    customer_code: customerCode,
    customer_type: payload.customer_type,
    company_name: normalizeText(payload.company_name),
    contact_person: normalizeText(payload.contact_person),
    email: normalizedEmail,
    phone: normalizeText(payload.phone),
    alternate_phone: normalizeText(payload.alternate_phone) || null,
    gst_number: normalizeText(payload.gst_number) || null,
    pan_number: normalizeText(payload.pan_number) || null,
    status: payload.status || 'ACTIVE',
    verification_status: payload.verification_status || 'PENDING'
  });

  return getCustomerById(customer.id);
};

const updateCustomer = async (id, payload) => {
  const customer = await db.Customer.findByPk(id);

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  const normalizedEmail = normalizeEmail(payload.email);

  await assertUniqueCustomerFields({
    customer_code: payload.customer_code,
    email: normalizedEmail,
    phone: payload.phone,
    excludeId: id
  });

  await customer.update({
    customer_code: payload.customer_code ?? customer.customer_code,
    customer_type: payload.customer_type ?? customer.customer_type,
    company_name: payload.company_name ?? customer.company_name,
    contact_person: payload.contact_person ?? customer.contact_person,
    email: normalizedEmail ?? customer.email,
    phone: payload.phone ?? customer.phone,
    alternate_phone: payload.alternate_phone ?? customer.alternate_phone,
    gst_number: payload.gst_number ?? customer.gst_number,
    pan_number: payload.pan_number ?? customer.pan_number,
    status: payload.status ?? customer.status,
    verification_status: payload.verification_status ?? customer.verification_status
  });

  return getCustomerById(id);
};

const deleteCustomer = async (id) => {
  const customer = await getCustomerById(id);
  const transaction = await db.sequelize.transaction();

  try {
    await db.CustomerAddress.destroy({ where: { customer_id: id }, transaction });
    await db.CustomerDocument.destroy({ where: { customer_id: id }, transaction });
    await db.CustomerNote.destroy({ where: { customer_id: id }, transaction });
    await db.Customer.destroy({ where: { id }, transaction });
    await transaction.commit();

    await Promise.all(
      customer.documents.map((document) => storageService.deleteFile(document.document_file))
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateCustomerStatus = async (id, status) => {
  const customer = await db.Customer.findByPk(id);

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  await customer.update({ status });
  return customer;
};

const verifyCustomer = async (id, verification_status) => {
  const customer = await db.Customer.findByPk(id);

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  await customer.update({ verification_status });
  return customer;
};

const resetDefaultBillingAddress = async (customerId, transaction, excludeId = null) => {
  await db.CustomerAddress.update(
    { is_default: false },
    {
      where: {
        customer_id: customerId,
        address_type: 'BILLING',
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
      },
      transaction
    }
  );
};

const createCustomerAddress = async (customerId, payload) => {
  await getCustomerById(customerId);
  const transaction = await db.sequelize.transaction();

  try {
    if (payload.address_type === 'BILLING' && toBoolean(payload.is_default)) {
      await resetDefaultBillingAddress(customerId, transaction);
    }

    const address = await db.CustomerAddress.create(
      {
        customer_id: customerId,
        address_type: payload.address_type,
        address_line_1: payload.address_line_1,
        address_line_2: payload.address_line_2 || null,
        landmark: payload.landmark || null,
        city: payload.city,
        state: payload.state,
        country: payload.country,
        pincode: payload.pincode,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
        is_default: toBoolean(payload.is_default)
      },
      { transaction }
    );

    await transaction.commit();
    return address;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listCustomerAddresses = async (customerId) => {
  await getCustomerById(customerId);

  return db.CustomerAddress.findAll({
    where: { customer_id: customerId },
    order: [
      ['is_default', 'DESC'],
      ['created_at', 'DESC']
    ]
  });
};

const updateCustomerAddress = async (id, payload) => {
  const address = await db.CustomerAddress.findByPk(id);

  if (!address) {
    throw new AppError('Customer address not found.', 404);
  }

  const transaction = await db.sequelize.transaction();

  try {
    const addressType = payload.address_type ?? address.address_type;
    const isDefault = payload.is_default === undefined ? address.is_default : toBoolean(payload.is_default);

    if (addressType === 'BILLING' && isDefault) {
      await resetDefaultBillingAddress(address.customer_id, transaction, id);
    }

    await address.update(
      {
        address_type: addressType,
        address_line_1: payload.address_line_1 ?? address.address_line_1,
        address_line_2: payload.address_line_2 ?? address.address_line_2,
        landmark: payload.landmark ?? address.landmark,
        city: payload.city ?? address.city,
        state: payload.state ?? address.state,
        country: payload.country ?? address.country,
        pincode: payload.pincode ?? address.pincode,
        latitude: payload.latitude ?? address.latitude,
        longitude: payload.longitude ?? address.longitude,
        is_default: isDefault
      },
      { transaction }
    );

    await transaction.commit();
    return address;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteCustomerAddress = async (id) => {
  const address = await db.CustomerAddress.findByPk(id);

  if (!address) {
    throw new AppError('Customer address not found.', 404);
  }

  await address.destroy();
};

const createCustomerDocument = async (customerId, payload) => {
  await getCustomerById(customerId);

  const uploaded = await storageService.uploadFile({
    folder: `customers/documents/${customerId}`,
    filePayload: payload.document_file,
    allowedMimeTypes: DOCUMENT_MIME_TYPES
  });

  try {
    return await db.CustomerDocument.create({
      customer_id: customerId,
      document_type: payload.document_type,
      document_number: payload.document_number,
      document_file: uploaded.path,
      verification_status: payload.verification_status || 'PENDING',
      remarks: payload.remarks || null
    });
  } catch (error) {
    await storageService.deleteFile(uploaded.path);
    throw error;
  }
};

const listCustomerDocuments = async (customerId) => {
  await getCustomerById(customerId);

  return db.CustomerDocument.findAll({
    where: { customer_id: customerId },
    order: [['created_at', 'DESC']]
  });
};

const updateCustomerDocument = async (id, payload) => {
  const document = await db.CustomerDocument.findByPk(id);

  if (!document) {
    throw new AppError('Customer document not found.', 404);
  }

  const existingFilePath = document.document_file;
  let documentFilePath = document.document_file;
  let uploadedDocumentPath = null;

  if (payload.document_file) {
    const uploaded = await storageService.uploadFile({
      folder: `customers/documents/${document.customer_id}`,
      filePayload: payload.document_file,
      allowedMimeTypes: DOCUMENT_MIME_TYPES
    });
    documentFilePath = uploaded.path;
    uploadedDocumentPath = uploaded.path;
  }

  try {
    await document.update({
      document_type: payload.document_type ?? document.document_type,
      document_number: payload.document_number ?? document.document_number,
      document_file: documentFilePath,
      verification_status: payload.verification_status ?? document.verification_status,
      remarks: payload.remarks ?? document.remarks
    });
  } catch (error) {
    if (uploadedDocumentPath) {
      await storageService.deleteFile(uploadedDocumentPath);
    }
    throw error;
  }

  if (uploadedDocumentPath && existingFilePath !== uploadedDocumentPath) {
    await storageService.deleteFile(existingFilePath);
  }

  return document;
};

const deleteCustomerDocument = async (id) => {
  const document = await db.CustomerDocument.findByPk(id);

  if (!document) {
    throw new AppError('Customer document not found.', 404);
  }

  await document.destroy();
  await storageService.deleteFile(document.document_file);
};

const createCustomerNote = async (customerId, note, createdBy) => {
  await getCustomerById(customerId);

  return db.CustomerNote.create({
    customer_id: customerId,
    note,
    created_by: createdBy
  });
};

const listCustomerNotes = async (customerId) => {
  await getCustomerById(customerId);

  return db.CustomerNote.findAll({
    where: { customer_id: customerId },
    include: [
      {
        model: db.User,
        as: 'createdBy',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

const deleteCustomerNote = async (id) => {
  const note = await db.CustomerNote.findByPk(id);

  if (!note) {
    throw new AppError('Customer note not found.', 404);
  }

  await note.destroy();
};

const getCustomerDashboardStats = async () => {
  const [totalCustomers, verifiedCustomers, businessCustomers, activeCustomers] =
    await Promise.all([
      db.Customer.count(),
      db.Customer.count({ where: { verification_status: 'VERIFIED' } }),
      db.Customer.count({ where: { customer_type: 'BUSINESS' } }),
      db.Customer.count({ where: { status: 'ACTIVE' } })
    ]);

  return {
    totalCustomers,
    verifiedCustomers,
    businessCustomers,
    activeCustomers
  };
};

module.exports = {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS,
  CUSTOMER_ADDRESS_TYPES,
  CUSTOMER_DOCUMENT_TYPES,
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
