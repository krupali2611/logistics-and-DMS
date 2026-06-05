const { Op, col, where } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storage/storageService');
const {
  VEHICLE_STATUS,
  VEHICLE_VERIFICATION_STATUS,
  VEHICLE_AVAILABILITY_STATUS,
  VEHICLE_DOCUMENT_TYPES,
  DRIVER_VEHICLE_ASSIGNMENT_STATUS
} = require('../constants/vehicleConstants');

const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const buildPagination = ({ page, limit, totalRecords }) => ({
  page,
  limit,
  totalRecords,
  totalPages: Math.ceil(totalRecords / limit) || 1
});

const ensureVehicleTypeExists = async (vehicleTypeId) => {
  const vehicleType = await db.VehicleType.findByPk(vehicleTypeId);

  if (!vehicleType) {
    throw new AppError('Vehicle type not found.', 404);
  }

  return vehicleType;
};

const getVehicleTypeById = async (id) => {
  const vehicleType = await db.VehicleType.findByPk(id);

  if (!vehicleType) {
    throw new AppError('Vehicle type not found.', 404);
  }

  return vehicleType;
};

const assertUniqueVehicleTypeName = async (type_name, excludeId = null) => {
  if (!type_name) {
    return;
  }

  const existingVehicleType = await db.VehicleType.findOne({
    where: {
      type_name,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {})
    }
  });

  if (existingVehicleType) {
    throw new AppError('Vehicle type already exists.', 409);
  }
};

const listVehicleTypes = async (query = {}) => {
  const whereClause = {};
  if (query.status) {
    whereClause.status = query.status;
  }

  return db.VehicleType.findAll({
    where: whereClause,
    order: [['type_name', 'ASC']]
  });
};

const createVehicleType = async (payload) => {
  await assertUniqueVehicleTypeName(payload.type_name);

  if (
    payload.min_capacity &&
    payload.max_capacity &&
    Number(payload.min_capacity) > Number(payload.max_capacity)
  ) {
    throw new AppError('Minimum capacity cannot be greater than maximum capacity.', 422);
  }

  return db.VehicleType.create({
    type_name: payload.type_name,
    description: payload.description || null,
    min_capacity: payload.min_capacity || null,
    max_capacity: payload.max_capacity || null,
    status: payload.status || 'ACTIVE'
  });
};

const updateVehicleType = async (id, payload) => {
  const vehicleType = await getVehicleTypeById(id);
  await assertUniqueVehicleTypeName(payload.type_name, id);

  const minCapacity = payload.min_capacity ?? vehicleType.min_capacity;
  const maxCapacity = payload.max_capacity ?? vehicleType.max_capacity;

  if (minCapacity && maxCapacity && Number(minCapacity) > Number(maxCapacity)) {
    throw new AppError('Minimum capacity cannot be greater than maximum capacity.', 422);
  }

  await vehicleType.update({
    type_name: payload.type_name ?? vehicleType.type_name,
    description: payload.description ?? vehicleType.description,
    min_capacity: minCapacity,
    max_capacity: maxCapacity,
    status: payload.status ?? vehicleType.status
  });

  return vehicleType;
};

const deleteVehicleType = async (id) => {
  const vehicleType = await getVehicleTypeById(id);
  const linkedVehicles = await db.Vehicle.count({ where: { vehicle_type_id: id } });

  if (linkedVehicles > 0) {
    throw new AppError('Vehicle type cannot be deleted while vehicles are linked to it.', 409);
  }

  await vehicleType.destroy();
};

const buildVehicleFilters = ({
  search,
  status,
  verification_status,
  availability_status,
  vehicle_type_id
}) => {
  const filters = {};

  if (status) {
    filters.status = status;
  }

  if (verification_status) {
    filters.verification_status = verification_status;
  }

  if (availability_status) {
    filters.availability_status = availability_status;
  }

  if (vehicle_type_id) {
    filters.vehicle_type_id = vehicle_type_id;
  }

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    filters[Op.or] = [
      { vehicle_number: { [Op.iLike]: searchTerm } },
      { registration_number: { [Op.iLike]: searchTerm } },
      { brand: { [Op.iLike]: searchTerm } },
      { model: { [Op.iLike]: searchTerm } },
      where(col('vehicleType.type_name'), { [Op.iLike]: searchTerm })
    ];
  }

  return filters;
};

const assertUniqueVehicleFields = async ({
  vehicle_number,
  registration_number,
  insurance_number,
  excludeId = null
}) => {
  const orConditions = [];

  if (vehicle_number) {
    orConditions.push({ vehicle_number });
  }

  if (registration_number) {
    orConditions.push({ registration_number });
  }

  if (insurance_number) {
    orConditions.push({ insurance_number });
  }

  if (orConditions.length === 0) {
    return;
  }

  const existingVehicle = await db.Vehicle.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: orConditions },
        excludeId ? { id: { [Op.ne]: excludeId } } : {}
      ]
    }
  });

  if (!existingVehicle) {
    return;
  }

  if (vehicle_number && existingVehicle.vehicle_number === vehicle_number) {
    throw new AppError('Vehicle number already exists.', 409);
  }

  if (registration_number && existingVehicle.registration_number === registration_number) {
    throw new AppError('Registration number already exists.', 409);
  }

  if (insurance_number && existingVehicle.insurance_number === insurance_number) {
    throw new AppError('Insurance number already exists.', 409);
  }
};

const assertCapacityWithinTypeRange = (vehicleType, capacity) => {
  if (capacity === undefined || capacity === null) {
    return;
  }

  const normalizedCapacity = Number(capacity);
  if (vehicleType.min_capacity !== null && normalizedCapacity < Number(vehicleType.min_capacity)) {
    throw new AppError('Vehicle capacity is below the minimum allowed for this type.', 422);
  }

  if (vehicleType.max_capacity !== null && normalizedCapacity > Number(vehicleType.max_capacity)) {
    throw new AppError('Vehicle capacity exceeds the maximum allowed for this type.', 422);
  }
};

const getVehicleById = async (id) => {
  const vehicle = await db.Vehicle.findByPk(id, {
    include: [
      {
        model: db.VehicleType,
        as: 'vehicleType'
      },
      {
        model: db.VehicleDocument,
        as: 'documents'
      },
      {
        model: db.DriverVehicleAssignment,
        as: 'assignments',
        include: [
          {
            model: db.Driver,
            as: 'driver',
            attributes: [
              'id',
              'driver_code',
              'first_name',
              'last_name',
              'phone',
              'verification_status',
              'availability_status'
            ]
          }
        ]
      }
    ],
    order: [
      [{ model: db.VehicleDocument, as: 'documents' }, 'created_at', 'DESC'],
      [{ model: db.DriverVehicleAssignment, as: 'assignments' }, 'assigned_at', 'DESC']
    ]
  });

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404);
  }

  return vehicle;
};

const listVehicles = async (query) => {
  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 10), 100);
  const offset = (page - 1) * limit;
  const whereClause = buildVehicleFilters(query);

  const { rows, count } = await db.Vehicle.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: db.VehicleType,
        as: 'vehicleType',
        attributes: ['id', 'type_name']
      },
      {
        model: db.VehicleDocument,
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

const createVehicle = async (payload) => {
  await assertUniqueVehicleFields(payload);
  const vehicleType = await ensureVehicleTypeExists(payload.vehicle_type_id);
  assertCapacityWithinTypeRange(vehicleType, payload.capacity);

  const vehicle = await db.Vehicle.create({
    vehicle_number: payload.vehicle_number.toUpperCase(),
    vehicle_type_id: payload.vehicle_type_id,
    brand: payload.brand,
    model: payload.model,
    manufacturing_year: payload.manufacturing_year,
    fuel_type: payload.fuel_type,
    capacity: payload.capacity,
    insurance_number: payload.insurance_number || null,
    insurance_expiry: payload.insurance_expiry || null,
    registration_number: payload.registration_number.toUpperCase(),
    registration_expiry: payload.registration_expiry || null,
    status: payload.status || 'ACTIVE',
    verification_status: payload.verification_status || 'PENDING',
    availability_status: payload.availability_status || 'AVAILABLE'
  });

  return getVehicleById(vehicle.id);
};

const updateVehicle = async (id, payload) => {
  const vehicle = await db.Vehicle.findByPk(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404);
  }

  await assertUniqueVehicleFields({
    ...payload,
    vehicle_number: payload.vehicle_number ? payload.vehicle_number.toUpperCase() : undefined,
    registration_number: payload.registration_number
      ? payload.registration_number.toUpperCase()
      : undefined,
    excludeId: id
  });

  const vehicleType = await ensureVehicleTypeExists(payload.vehicle_type_id || vehicle.vehicle_type_id);
  assertCapacityWithinTypeRange(vehicleType, payload.capacity ?? vehicle.capacity);

  await vehicle.update({
    vehicle_number: payload.vehicle_number ? payload.vehicle_number.toUpperCase() : vehicle.vehicle_number,
    vehicle_type_id: payload.vehicle_type_id ?? vehicle.vehicle_type_id,
    brand: payload.brand ?? vehicle.brand,
    model: payload.model ?? vehicle.model,
    manufacturing_year: payload.manufacturing_year ?? vehicle.manufacturing_year,
    fuel_type: payload.fuel_type ?? vehicle.fuel_type,
    capacity: payload.capacity ?? vehicle.capacity,
    insurance_number: payload.insurance_number ?? vehicle.insurance_number,
    insurance_expiry: payload.insurance_expiry ?? vehicle.insurance_expiry,
    registration_number: payload.registration_number
      ? payload.registration_number.toUpperCase()
      : vehicle.registration_number,
    registration_expiry: payload.registration_expiry ?? vehicle.registration_expiry,
    status: payload.status ?? vehicle.status,
    verification_status: payload.verification_status ?? vehicle.verification_status,
    availability_status: payload.availability_status ?? vehicle.availability_status
  });

  return getVehicleById(id);
};

const deleteVehicle = async (id) => {
  const vehicle = await getVehicleById(id);
  const activeAssignment = vehicle.assignments.find((assignment) => assignment.status === 'ACTIVE');

  if (activeAssignment) {
    throw new AppError('Vehicle cannot be deleted while an active assignment exists.', 409);
  }

  const transaction = await db.sequelize.transaction();

  try {
    await db.VehicleDocument.destroy({ where: { vehicle_id: id }, transaction });
    await db.DriverVehicleAssignment.destroy({ where: { vehicle_id: id }, transaction });
    await db.Vehicle.destroy({ where: { id }, transaction });
    await transaction.commit();

    await Promise.all(
      vehicle.documents.map((document) => storageService.deleteFile(document.document_file))
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateVehicleStatus = async (id, status) => {
  const vehicle = await db.Vehicle.findByPk(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404);
  }

  await vehicle.update({ status });
  return vehicle;
};

const verifyVehicle = async (id, verification_status) => {
  const vehicle = await db.Vehicle.findByPk(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404);
  }

  await vehicle.update({ verification_status });
  return vehicle;
};

const updateVehicleAvailability = async (id, availability_status) => {
  const vehicle = await db.Vehicle.findByPk(id);

  if (!vehicle) {
    throw new AppError('Vehicle not found.', 404);
  }

  const activeAssignment = await db.DriverVehicleAssignment.findOne({
    where: {
      vehicle_id: id,
      status: 'ACTIVE'
    }
  });

  if (activeAssignment && availability_status === 'AVAILABLE') {
    throw new AppError('Assigned vehicles cannot be marked as available until unassigned.', 409);
  }

  await vehicle.update({ availability_status });
  return vehicle;
};

const createVehicleDocument = async (vehicleId, payload) => {
  await getVehicleById(vehicleId);

  const uploaded = await storageService.uploadFile({
    folder: `vehicles/documents/${vehicleId}`,
    filePayload: payload.document_file,
    allowedMimeTypes: DOCUMENT_MIME_TYPES
  });

  try {
    return await db.VehicleDocument.create({
      vehicle_id: vehicleId,
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

const listVehicleDocuments = async (vehicleId) => {
  await getVehicleById(vehicleId);

  return db.VehicleDocument.findAll({
    where: { vehicle_id: vehicleId },
    order: [['created_at', 'DESC']]
  });
};

const updateVehicleDocument = async (id, payload) => {
  const document = await db.VehicleDocument.findByPk(id);

  if (!document) {
    throw new AppError('Vehicle document not found.', 404);
  }

  const existingDocumentFilePath = document.document_file;
  let documentFilePath = document.document_file;
  let uploadedDocumentPath = null;

  if (payload.document_file) {
    const uploaded = await storageService.uploadFile({
      folder: `vehicles/documents/${document.vehicle_id}`,
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

const deleteVehicleDocument = async (id) => {
  const document = await db.VehicleDocument.findByPk(id);

  if (!document) {
    throw new AppError('Vehicle document not found.', 404);
  }

  await document.destroy();
  await storageService.deleteFile(document.document_file);
};

const getActiveAssignmentForDriver = async (driverId, transaction) =>
  db.DriverVehicleAssignment.findOne({
    where: {
      driver_id: driverId,
      status: 'ACTIVE'
    },
    transaction
  });

const getActiveAssignmentForVehicle = async (vehicleId, transaction) =>
  db.DriverVehicleAssignment.findOne({
    where: {
      vehicle_id: vehicleId,
      status: 'ACTIVE'
    },
    transaction
  });

const assignVehicle = async (payload) => {
  const transaction = await db.sequelize.transaction();

  try {
    const [driver, vehicle, activeDriverAssignment, activeVehicleAssignment] = await Promise.all([
      db.Driver.findByPk(payload.driver_id, { transaction }),
      db.Vehicle.findByPk(payload.vehicle_id, { transaction }),
      getActiveAssignmentForDriver(payload.driver_id, transaction),
      getActiveAssignmentForVehicle(payload.vehicle_id, transaction)
    ]);

    if (!driver) {
      throw new AppError('Driver not found.', 404);
    }

    if (!vehicle) {
      throw new AppError('Vehicle not found.', 404);
    }

    if (driver.verification_status !== 'VERIFIED') {
      throw new AppError('Only verified drivers can be assigned to vehicles.', 409);
    }

    if (vehicle.verification_status !== 'VERIFIED') {
      throw new AppError('Only verified vehicles can be assigned to drivers.', 409);
    }

    if (activeDriverAssignment) {
      throw new AppError('Driver already has an active vehicle assignment.', 409);
    }

    if (activeVehicleAssignment) {
      throw new AppError('Vehicle already has an active driver assignment.', 409);
    }

    const assignment = await db.DriverVehicleAssignment.create(
      {
        driver_id: payload.driver_id,
        vehicle_id: payload.vehicle_id,
        assigned_at: payload.assigned_at || new Date(),
        status: 'ACTIVE'
      },
      { transaction }
    );

    await Promise.all([
      vehicle.update({ availability_status: 'ASSIGNED' }, { transaction }),
      driver.update({ availability_status: 'BUSY' }, { transaction })
    ]);

    await transaction.commit();

    return db.DriverVehicleAssignment.findByPk(assignment.id, {
      include: [
        {
          model: db.Driver,
          as: 'driver',
          attributes: ['id', 'driver_code', 'first_name', 'last_name', 'phone']
        },
        {
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicle_number', 'brand', 'model', 'availability_status'],
          include: [
            {
              model: db.VehicleType,
              as: 'vehicleType',
              attributes: ['id', 'type_name']
            }
          ]
        }
      ]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const removeAssignment = async (id) => {
  const transaction = await db.sequelize.transaction();

  try {
    const assignment = await db.DriverVehicleAssignment.findByPk(id, { transaction });

    if (!assignment) {
      throw new AppError('Vehicle assignment not found.', 404);
    }

    if (assignment.status !== 'ACTIVE') {
      throw new AppError('Vehicle assignment is already inactive.', 409);
    }

    const [driver, vehicle] = await Promise.all([
      db.Driver.findByPk(assignment.driver_id, { transaction }),
      db.Vehicle.findByPk(assignment.vehicle_id, { transaction })
    ]);

    await assignment.update(
      {
        status: 'INACTIVE',
        unassigned_at: new Date()
      },
      { transaction }
    );

    await Promise.all([
      vehicle?.update({ availability_status: 'AVAILABLE' }, { transaction }),
      driver?.update({ availability_status: 'ONLINE' }, { transaction })
    ]);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listAssignments = async (query) => {
  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 10), 100);
  const offset = (page - 1) * limit;
  const whereClause = {};

  if (query.status) {
    whereClause.status = query.status;
  }

  if (query.driver_id) {
    whereClause.driver_id = query.driver_id;
  }

  if (query.vehicle_id) {
    whereClause.vehicle_id = query.vehicle_id;
  }

  const { rows, count } = await db.DriverVehicleAssignment.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: db.Driver,
        as: 'driver',
        attributes: ['id', 'driver_code', 'first_name', 'last_name', 'phone']
      },
      {
        model: db.Vehicle,
        as: 'vehicle',
        attributes: ['id', 'vehicle_number', 'brand', 'model', 'availability_status'],
        include: [
          {
            model: db.VehicleType,
            as: 'vehicleType',
            attributes: ['id', 'type_name']
          }
        ]
      }
    ],
    order: [['assigned_at', 'DESC']],
    distinct: true
  });

  return {
    records: rows,
    pagination: buildPagination({ page, limit, totalRecords: count })
  };
};

const getAssignmentOptions = async () => {
  const [drivers, vehicles] = await Promise.all([
    db.Driver.findAll({
      where: {
        status: 'ACTIVE',
        verification_status: 'VERIFIED',
        availability_status: {
          [Op.in]: ['ONLINE', 'OFFLINE']
        }
      },
      attributes: ['id', 'driver_code', 'first_name', 'last_name', 'phone', 'availability_status'],
      order: [['created_at', 'DESC']]
    }),
    db.Vehicle.findAll({
      where: {
        status: 'ACTIVE',
        verification_status: 'VERIFIED',
        availability_status: 'AVAILABLE'
      },
      attributes: ['id', 'vehicle_number', 'brand', 'model', 'availability_status'],
      include: [
        {
          model: db.VehicleType,
          as: 'vehicleType',
          attributes: ['id', 'type_name']
        }
      ],
      order: [['created_at', 'DESC']]
    })
  ]);

  return {
    drivers,
    vehicles
  };
};

const getVehicleDashboardStats = async () => {
  const [totalVehicles, activeVehicles, verifiedVehicles, availableVehicles, assignedVehicles] =
    await Promise.all([
      db.Vehicle.count(),
      db.Vehicle.count({ where: { status: 'ACTIVE' } }),
      db.Vehicle.count({ where: { verification_status: 'VERIFIED' } }),
      db.Vehicle.count({ where: { availability_status: 'AVAILABLE' } }),
      db.Vehicle.count({ where: { availability_status: 'ASSIGNED' } })
    ]);

  return {
    totalVehicles,
    activeVehicles,
    verifiedVehicles,
    availableVehicles,
    assignedVehicles
  };
};

module.exports = {
  VEHICLE_STATUS,
  VEHICLE_VERIFICATION_STATUS,
  VEHICLE_AVAILABILITY_STATUS,
  VEHICLE_DOCUMENT_TYPES,
  DRIVER_VEHICLE_ASSIGNMENT_STATUS,
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
  getAssignmentOptions,
  getVehicleDashboardStats
};
