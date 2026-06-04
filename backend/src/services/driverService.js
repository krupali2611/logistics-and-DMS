const { Op, fn, col, where } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storage/storageService');
const {
  DRIVER_STATUS,
  DRIVER_AVAILABILITY_STATUS,
  DRIVER_VERIFICATION_STATUS
} = require('../constants/driverConstants');

const PROFILE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const buildPagination = ({ page, limit, totalRecords }) => ({
  page,
  limit,
  totalRecords,
  totalPages: Math.ceil(totalRecords / limit) || 1
});

const buildDriverFilters = ({ search, status, availability_status, verification_status }) => {
  const filters = {};

  if (status) {
    filters.status = status;
  }

  if (availability_status) {
    filters.availability_status = availability_status;
  }

  if (verification_status) {
    filters.verification_status = verification_status;
  }

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    filters[Op.or] = [
      { driver_code: { [Op.iLike]: searchTerm } },
      { first_name: { [Op.iLike]: searchTerm } },
      { last_name: { [Op.iLike]: searchTerm } },
      { email: { [Op.iLike]: searchTerm } },
      { phone: { [Op.iLike]: searchTerm } },
      where(fn('concat', col('first_name'), ' ', col('last_name')), {
        [Op.iLike]: searchTerm
      })
    ];
  }

  return filters;
};

const getDriverById = async (id) => {
  const driver = await db.Driver.findByPk(id, {
    include: [
      {
        model: db.DriverDocument,
        as: 'documents'
      },
      {
        model: db.DriverLocation,
        as: 'location'
      }
    ],
    order: [[{ model: db.DriverDocument, as: 'documents' }, 'created_at', 'DESC']]
  });

  if (!driver) {
    throw new AppError('Driver not found.', 404);
  }

  return driver;
};

const assertUniqueDriverFields = async ({ driver_code, email, phone, excludeId = null }) => {
  const orConditions = [];

  if (driver_code) {
    orConditions.push({ driver_code });
  }

  if (email) {
    orConditions.push({ email: email.toLowerCase() });
  }

  if (phone) {
    orConditions.push({ phone });
  }

  if (orConditions.length === 0) {
    return;
  }

  const existingDriver = await db.Driver.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: orConditions },
        excludeId ? { id: { [Op.ne]: excludeId } } : {}
      ]
    }
  });

  if (!existingDriver) {
    return;
  }

  if (driver_code && existingDriver.driver_code === driver_code) {
    throw new AppError('Driver code already exists.', 409);
  }

  if (email && existingDriver.email === email.toLowerCase()) {
    throw new AppError('Driver email already exists.', 409);
  }

  if (phone && existingDriver.phone === phone) {
    throw new AppError('Driver phone already exists.', 409);
  }
};

const uploadProfileImageIfNeeded = async (profileImage) => {
  if (!profileImage) {
    return null;
  }

  const uploaded = await storageService.uploadFile({
    folder: 'drivers/profiles',
    filePayload: profileImage,
    allowedMimeTypes: PROFILE_IMAGE_MIME_TYPES
  });

  return uploaded.path;
};

const listDrivers = async (query) => {
  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 10), 100);
  const offset = (page - 1) * limit;
  const whereClause = buildDriverFilters(query);

  const { rows, count } = await db.Driver.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: db.DriverDocument,
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

const createDriver = async (payload) => {
  await assertUniqueDriverFields(payload);

  const transaction = await db.sequelize.transaction();
  let profileImagePath = null;

  try {
    profileImagePath = await uploadProfileImageIfNeeded(payload.profile_image);

    const driver = await db.Driver.create(
      {
        driver_code: payload.driver_code,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email.toLowerCase(),
        phone: payload.phone,
        date_of_birth: payload.date_of_birth || null,
        gender: payload.gender || null,
        address: payload.address || null,
        city: payload.city || null,
        state: payload.state || null,
        pincode: payload.pincode || null,
        profile_image: profileImagePath,
        status: payload.status || 'ACTIVE',
        availability_status: payload.availability_status || 'OFFLINE',
        verification_status: payload.verification_status || 'PENDING'
      },
      { transaction }
    );

    await db.DriverLocation.create(
      {
        driver_id: driver.id,
        latitude: null,
        longitude: null,
        last_updated: null
      },
      { transaction }
    );

    await transaction.commit();
    return getDriverById(driver.id);
  } catch (error) {
    await transaction.rollback();
    if (profileImagePath) {
      await storageService.deleteFile(profileImagePath);
    }
    throw error;
  }
};

const updateDriver = async (id, payload) => {
  const driver = await db.Driver.findByPk(id);

  if (!driver) {
    throw new AppError('Driver not found.', 404);
  }

  await assertUniqueDriverFields({ ...payload, excludeId: id });

  const existingProfileImagePath = driver.profile_image;
  let profileImagePath = driver.profile_image;
  let uploadedProfileImagePath = null;

  if (payload.profile_image) {
    profileImagePath = await uploadProfileImageIfNeeded(payload.profile_image);
    uploadedProfileImagePath = profileImagePath;
  }

  try {
    await driver.update({
      driver_code: payload.driver_code ?? driver.driver_code,
      first_name: payload.first_name ?? driver.first_name,
      last_name: payload.last_name ?? driver.last_name,
      email: payload.email ? payload.email.toLowerCase() : driver.email,
      phone: payload.phone ?? driver.phone,
      date_of_birth: payload.date_of_birth ?? driver.date_of_birth,
      gender: payload.gender ?? driver.gender,
      address: payload.address ?? driver.address,
      city: payload.city ?? driver.city,
      state: payload.state ?? driver.state,
      pincode: payload.pincode ?? driver.pincode,
      profile_image: profileImagePath,
      status: payload.status ?? driver.status,
      availability_status: payload.availability_status ?? driver.availability_status,
      verification_status: payload.verification_status ?? driver.verification_status
    });
  } catch (error) {
    if (uploadedProfileImagePath) {
      await storageService.deleteFile(uploadedProfileImagePath);
    }
    throw error;
  }

  if (
    uploadedProfileImagePath &&
    existingProfileImagePath &&
    existingProfileImagePath !== uploadedProfileImagePath
  ) {
    await storageService.deleteFile(existingProfileImagePath);
  }

  return getDriverById(id);
};

const deleteDriver = async (id) => {
  const driver = await getDriverById(id);
  const transaction = await db.sequelize.transaction();

  try {
    await db.DriverDocument.destroy({ where: { driver_id: id }, transaction });
    await db.DriverLocation.destroy({ where: { driver_id: id }, transaction });
    await db.Driver.destroy({ where: { id }, transaction });
    await transaction.commit();

    if (driver.profile_image) {
      await storageService.deleteFile(driver.profile_image);
    }

    await Promise.all(
      driver.documents.map((document) => storageService.deleteFile(document.document_file))
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateDriverStatus = async (id, status) => {
  const driver = await db.Driver.findByPk(id);

  if (!driver) {
    throw new AppError('Driver not found.', 404);
  }

  await driver.update({ status });
  return driver;
};

const updateDriverAvailability = async (id, availability_status) => {
  const driver = await db.Driver.findByPk(id);

  if (!driver) {
    throw new AppError('Driver not found.', 404);
  }

  await driver.update({ availability_status });
  return driver;
};

const verifyDriver = async (id, verification_status) => {
  const driver = await db.Driver.findByPk(id);

  if (!driver) {
    throw new AppError('Driver not found.', 404);
  }

  await driver.update({ verification_status });
  return driver;
};

const createDriverDocument = async (driverId, payload) => {
  await getDriverById(driverId);

  const uploaded = await storageService.uploadFile({
    folder: `drivers/documents/${driverId}`,
    filePayload: payload.document_file,
    allowedMimeTypes: DOCUMENT_MIME_TYPES
  });

  try {
    return await db.DriverDocument.create({
      driver_id: driverId,
      document_type: payload.document_type,
      document_number: payload.document_number,
      document_file: uploaded.path,
      expiry_date: payload.expiry_date || null,
      verification_status: payload.verification_status || 'PENDING',
      remarks: payload.remarks || null
    });
  } catch (error) {
    await storageService.deleteFile(uploaded.path);
    throw error;
  }
};

const listDriverDocuments = async (driverId) => {
  await getDriverById(driverId);

  return db.DriverDocument.findAll({
    where: { driver_id: driverId },
    order: [['created_at', 'DESC']]
  });
};

const updateDriverDocument = async (id, payload) => {
  const document = await db.DriverDocument.findByPk(id);

  if (!document) {
    throw new AppError('Driver document not found.', 404);
  }

  const existingDocumentFilePath = document.document_file;
  let documentFilePath = document.document_file;
  let uploadedDocumentPath = null;

  if (payload.document_file) {
    const uploaded = await storageService.uploadFile({
      folder: `drivers/documents/${document.driver_id}`,
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
      expiry_date: payload.expiry_date ?? document.expiry_date,
      verification_status: payload.verification_status ?? document.verification_status,
      remarks: payload.remarks ?? document.remarks
    });
  } catch (error) {
    if (uploadedDocumentPath) {
      await storageService.deleteFile(uploadedDocumentPath);
    }
    throw error;
  }

  if (uploadedDocumentPath && existingDocumentFilePath !== uploadedDocumentPath) {
    await storageService.deleteFile(existingDocumentFilePath);
  }

  return document;
};

const deleteDriverDocument = async (id) => {
  const document = await db.DriverDocument.findByPk(id);

  if (!document) {
    throw new AppError('Driver document not found.', 404);
  }

  await document.destroy();
  await storageService.deleteFile(document.document_file);
};

const getDriverDashboardStats = async () => {
  const [totalDrivers, activeDrivers, onlineDrivers, pendingVerification] = await Promise.all([
    db.Driver.count(),
    db.Driver.count({ where: { status: 'ACTIVE' } }),
    db.Driver.count({ where: { availability_status: 'ONLINE' } }),
    db.Driver.count({ where: { verification_status: 'PENDING' } })
  ]);

  return {
    totalDrivers,
    activeDrivers,
    onlineDrivers,
    pendingVerification
  };
};

module.exports = {
  DRIVER_STATUS,
  DRIVER_AVAILABILITY_STATUS,
  DRIVER_VERIFICATION_STATUS,
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
  getDriverDashboardStats
};
