const { Op, col, fn, where } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storage/storageService');
const {
  getCustomerAddressAttributes,
  getCustomerAddressSchema
} = require('../utils/customerAddressSchema');
const {
  assertDocumentNameRules,
  assertUniqueDocumentType,
  normalizeOptionalText
} = require('../utils/documentValidation');
const {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS,
  CUSTOMER_ADDRESS_TYPES,
  CUSTOMER_DOCUMENT_TYPES
} = require('../constants/customerConstants');

const DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'image/webp',
  'application/pdf'
];

const buildPagination = ({ page, limit, totalRecords }) => ({
  page,
  limit,
  totalRecords,
  totalPages: Math.ceil(totalRecords / limit) || 1
});

const normalizeEmail = (email) => (email ? email.toLowerCase() : email);
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const toBoolean = (value) => value === true || value === 'true';
const buildFormattedAddress = (payload = {}) =>
  [
    payload.address_line_1,
    payload.address_line_2,
    payload.landmark,
    payload.city,
    payload.state,
    payload.country,
    payload.pincode
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(', ');

const buildCustomerAddressPayload = async (sequelize, payload, currentAddress = null) => {
  const schema = await getCustomerAddressSchema(sequelize);

  const nextPayload = {
    address_type: payload.address_type ?? currentAddress?.address_type,
    address_line_1: payload.address_line_1 ?? currentAddress?.address_line_1,
    address_line_2:
      payload.address_line_2 !== undefined ? payload.address_line_2 : currentAddress?.address_line_2,
    landmark: payload.landmark !== undefined ? payload.landmark : currentAddress?.landmark,
    city: payload.city ?? currentAddress?.city,
    state: payload.state ?? currentAddress?.state,
    country: payload.country ?? currentAddress?.country,
    pincode: payload.pincode ?? currentAddress?.pincode,
    latitude: payload.latitude !== undefined ? payload.latitude : currentAddress?.latitude,
    longitude: payload.longitude !== undefined ? payload.longitude : currentAddress?.longitude,
    is_default:
      payload.is_default === undefined
        ? currentAddress?.is_default ?? false
        : toBoolean(payload.is_default)
  };

  if (schema.hasPlaceId) {
    nextPayload.place_id =
      payload.place_id !== undefined ? normalizeText(payload.place_id) || null : currentAddress?.place_id ?? null;
  }

  if (schema.hasFormattedAddress) {
    nextPayload.formatted_address =
      payload.formatted_address !== undefined
        ? normalizeText(payload.formatted_address) || null
        : buildFormattedAddress(nextPayload);
  }

  if (schema.hasIsFavorite) {
    nextPayload.is_favorite =
      payload.is_favorite === undefined
        ? currentAddress?.is_favorite ?? false
        : toBoolean(payload.is_favorite);
  }

  return nextPayload;
};

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
  const addressAttributes = await getCustomerAddressAttributes(db.sequelize);
  const customer = await db.Customer.findByPk(id, {
    include: [
      {
        model: db.CustomerAddress,
        as: 'addresses',
        attributes: addressAttributes
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
  const addressAttributes = await getCustomerAddressAttributes(db.sequelize);
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
        attributes: addressAttributes.filter((attribute) =>
          ['id', 'address_type', 'is_default', 'is_favorite', 'formatted_address'].includes(attribute)
        )
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
    verification_status: payload.verification_status ?? customer.verification_status
  });

  return getCustomerById(id);
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

    const addressPayload = await buildCustomerAddressPayload(db.sequelize, {
      ...payload,
      customer_id: customerId
    });

    const address = await db.CustomerAddress.create(
      {
        customer_id: customerId,
        ...addressPayload
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
  const addressAttributes = await getCustomerAddressAttributes(db.sequelize);

  return db.CustomerAddress.findAll({
    where: { customer_id: customerId },
    attributes: addressAttributes,
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

    const addressPayload = await buildCustomerAddressPayload(
      db.sequelize,
      {
        ...payload,
        address_type: addressType,
        is_default: isDefault
      },
      address
    );

    await address.update(
      addressPayload,
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
  const existingDocuments = await db.CustomerDocument.findAll({
    where: { customer_id: customerId },
    attributes: ['id', 'customer_id', 'document_type']
  });

  assertUniqueDocumentType({
    documents: existingDocuments,
    ownerKey: 'customer_id',
    ownerId: customerId,
    documentType: payload.document_type
  });

  const documentName = assertDocumentNameRules(payload.document_type, payload.document_name);

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
      document_name: documentName,
      document_file: uploaded.path,
      verification_status: payload.verification_status || 'PENDING',
      remarks: normalizeOptionalText(payload.remarks)
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

  const nextDocumentType = payload.document_type ?? document.document_type;
  const nextDocumentName = payload.document_name ?? document.document_name;

  const existingDocuments = await db.CustomerDocument.findAll({
    where: { customer_id: document.customer_id },
    attributes: ['id', 'customer_id', 'document_type']
  });

  assertUniqueDocumentType({
    documents: existingDocuments,
    ownerKey: 'customer_id',
    ownerId: document.customer_id,
    documentType: nextDocumentType,
    excludeId: id
  });

  const normalizedDocumentName = assertDocumentNameRules(nextDocumentType, nextDocumentName);

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
      document_type: nextDocumentType,
      document_number: payload.document_number ?? document.document_number,
      document_name: normalizedDocumentName,
      document_file: documentFilePath,
      verification_status: payload.verification_status ?? document.verification_status,
      remarks:
        payload.remarks === undefined ? document.remarks : normalizeOptionalText(payload.remarks)
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
