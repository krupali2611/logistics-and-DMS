const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const storageService = require('./storage/storageService');
const pricingService = require('./pricingService');
const { generateShipmentNumber } = require('../utils/shipmentNumberGenerator');
const {
  SHIPMENT_TYPES,
  SHIPMENT_PRIORITIES,
  SHIPMENT_STATUSES
} = require('../constants/shipmentConstants');

const EDITABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT'];
const CANCELLABLE_SHIPMENT_STATUSES = ['DRAFT', 'PENDING_ASSIGNMENT', 'ASSIGNED'];

const ATTACHMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const buildPagination = ({ page, limit, totalRecords }) => ({
  page,
  limit,
  totalRecords,
  totalPages: Math.ceil(totalRecords / limit) || 1
});

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const toNullable = (value) => (value === undefined || value === '' ? null : value);
const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};
const resolveCoordinateValue = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const resolveAccessContext = (user = {}) => ({
  userId: user?.id || null,
  customerId: user?.customer_id || null,
  customerUserId: user?.customer_user_id || null
});

const formatAddressSnapshot = (address) =>
  [
    address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.city,
    address.state,
    address.country,
    address.pincode
  ]
    .filter((part) => part && part.toString().trim())
    .join(', ');

const resolveAddressSnapshot = ({ payloadSnapshot, address, existingSnapshot, addressChanged }) => {
  if (payloadSnapshot !== undefined) {
    return normalizeText(payloadSnapshot);
  }

  if (!existingSnapshot || addressChanged) {
    return formatAddressSnapshot(address);
  }

  return existingSnapshot;
};

const getShipmentIncludes = ({ includeTracking = true, includeAssignments = true } = {}) => {
  const includes = [
    {
      model: db.Customer,
      as: 'customer',
      attributes: ['id', 'customer_code', 'company_name', 'contact_person', 'phone', 'email', 'status']
    },
    {
      model: db.CustomerAddress,
      as: 'pickupAddress',
      attributes: [
        'id',
        'address_type',
        'address_line_1',
        'address_line_2',
        'landmark',
        'city',
        'state',
        'country',
        'pincode'
      ]
    },
    {
      model: db.CustomerAddress,
      as: 'deliveryAddress',
      attributes: [
        'id',
        'address_type',
        'address_line_1',
        'address_line_2',
        'landmark',
        'city',
        'state',
        'country',
        'pincode'
      ]
    },
    {
      model: db.VehicleType,
      as: 'vehicleType',
      attributes: ['id', 'type_name', 'description', 'min_capacity', 'max_capacity', 'status']
    },
    {
      model: db.FareEstimation,
      as: 'fareEstimation'
    },
    {
      model: db.ShipmentPackage,
      as: 'packages'
    },
    {
      model: db.ShipmentStatusHistory,
      as: 'statusHistory',
      include: [
        {
          model: db.User,
          as: 'updatedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: db.CustomerUser,
          as: 'updatedByCustomerUser',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    },
    {
      model: db.ShipmentAttachment,
      as: 'attachments',
      include: [
        {
          model: db.User,
          as: 'uploadedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    },
    {
      model: db.User,
      as: 'createdBy',
      attributes: ['id', 'first_name', 'last_name', 'email']
    },
    {
      model: db.User,
      as: 'cancelledBy',
      attributes: ['id', 'first_name', 'last_name', 'email']
    },
    {
      model: db.CustomerUser,
      as: 'createdByCustomerUser',
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
    }
  ];

  if (includeAssignments) {
    includes.push({
      model: db.ShipmentAssignment,
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
            'availability_status'
          ]
        },
        {
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicle_number', 'registration_number', 'availability_status']
        },
        {
          model: db.User,
          as: 'assignedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  }

  if (includeTracking) {
    includes.push({
      model: db.ShipmentTrackingEvent,
      as: 'trackingEvents',
      include: [
        {
          model: db.User,
          as: 'recordedBy',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  }

  return includes;
};

const buildShipmentFilters = (
  { search, status, priority, shipment_type, customer_id, created_from, created_to },
  accessContext
) => {
  const filters = {};

  if (accessContext.customerId) {
    filters.customer_id = accessContext.customerId;
  } else if (customer_id) {
    filters.customer_id = customer_id;
  }

  if (status) {
    filters.status = status;
  }

  if (priority) {
    filters.priority = priority;
  }

  if (shipment_type) {
    filters.shipment_type = shipment_type;
  }

  if (created_from || created_to) {
    filters.created_at = {};

    if (created_from) {
      filters.created_at[Op.gte] = new Date(created_from);
    }

    if (created_to) {
      filters.created_at[Op.lte] = new Date(`${created_to}T23:59:59.999Z`);
    }
  }

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    filters[Op.or] = [
      { shipment_number: { [Op.iLike]: searchTerm } },
      { pickup_address_snapshot: { [Op.iLike]: searchTerm } },
      { delivery_address_snapshot: { [Op.iLike]: searchTerm } },
      { '$customer.company_name$': { [Op.iLike]: searchTerm } },
      { '$customer.contact_person$': { [Op.iLike]: searchTerm } },
      { '$customer.phone$': { [Op.iLike]: searchTerm } },
      { '$pickupAddress.city$': { [Op.iLike]: searchTerm } },
      { '$deliveryAddress.city$': { [Op.iLike]: searchTerm } }
    ];
  }

  return filters;
};

const normalizePackage = (pkg) => ({
  id: pkg.id,
  package_name: normalizeText(pkg.package_name),
  package_type: normalizeText(pkg.package_type),
  weight: toNumber(pkg.weight),
  length: toNumber(pkg.length),
  width: toNumber(pkg.width),
  height: toNumber(pkg.height),
  quantity: Math.max(1, Number(pkg.quantity || 1)),
  declared_value: toNullable(pkg.declared_value)
});

const ensureEditableShipment = (shipment) => {
  if (!EDITABLE_SHIPMENT_STATUSES.includes(shipment.status)) {
    throw new AppError(
      `Shipment can only be edited in statuses: ${EDITABLE_SHIPMENT_STATUSES.join(', ')}.`,
      409
    );
  }
};

const ensureShipmentAccess = (shipment, accessContext) => {
  if (accessContext.customerId && shipment.customer_id !== accessContext.customerId) {
    throw new AppError('Shipment not found.', 404);
  }
};

const validatePackageCollection = (packages) => {
  if (!Array.isArray(packages) || packages.length === 0) {
    throw new AppError('At least one package is required for a shipment.', 422);
  }
};

const calculateShipmentMetrics = (packages) => {
  const metrics = packages.reduce(
    (accumulator, currentPackage) => {
      const quantity = Math.max(1, toNumber(currentPackage.quantity, 1));
      const weight = toNumber(currentPackage.weight);
      const length = toNumber(currentPackage.length);
      const width = toNumber(currentPackage.width);
      const height = toNumber(currentPackage.height);

      accumulator.package_count += quantity;
      accumulator.total_weight += weight * quantity;
      accumulator.total_volume += length * width * height * quantity;

      return accumulator;
    },
    {
      package_count: 0,
      total_weight: 0,
      total_volume: 0
    }
  );

  return {
    package_count: metrics.package_count,
    total_weight: Number(metrics.total_weight.toFixed(2)),
    total_volume: Number(metrics.total_volume.toFixed(2))
  };
};

const getCustomerAddressOrFail = async (customerId, addressId, label) => {
  const address = await db.CustomerAddress.findOne({
    where: {
      id: addressId,
      customer_id: customerId
    }
  });

  if (!address) {
    throw new AppError(`${label} is invalid for the selected customer.`, 422);
  }

  return address;
};

const validateShipmentRelations = async ({
  customer_id,
  pickup_address_id,
  delivery_address_id,
  vehicle_type_id
}) => {
  const customer = await db.Customer.findByPk(customer_id);

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  if (customer.status === 'BLOCKED') {
    throw new AppError('Blocked customers cannot create or update shipments.', 403);
  }

  const pickupAddress = await getCustomerAddressOrFail(customer_id, pickup_address_id, 'Pickup address');
  const deliveryAddress = await getCustomerAddressOrFail(
    customer_id,
    delivery_address_id,
    'Delivery address'
  );

  if (pickup_address_id === delivery_address_id) {
    throw new AppError('Pickup and delivery addresses must be different.', 422);
  }

  const vehicleType = await db.VehicleType.findByPk(vehicle_type_id);
  if (!vehicleType) {
    throw new AppError('Vehicle type not found.', 404);
  }

  return {
    customer,
    pickupAddress,
    deliveryAddress,
    vehicleType
  };
};

const appendStatusHistory = async ({
  shipment_id,
  old_status,
  new_status,
  remarks,
  updated_by,
  updated_by_customer_user_id,
  transaction
}) =>
  db.ShipmentStatusHistory.create(
    {
      shipment_id,
      old_status,
      new_status,
      remarks: remarks || null,
      updated_by,
      updated_by_customer_user_id
    },
    { transaction }
  );

const resolveCustomerId = ({ requestedCustomerId, existingCustomerId = null, accessContext }) => {
  if (accessContext.customerId) {
    if (requestedCustomerId && requestedCustomerId !== accessContext.customerId) {
      throw new AppError('Customer users can only manage their own shipments.', 403);
    }

    return accessContext.customerId;
  }

  return requestedCustomerId || existingCustomerId || null;
};

const buildShipmentPersistenceData = ({
  payload,
  existingShipment = null,
  customerId,
  pickupAddress,
  deliveryAddress
}) => {
  const pickupAddressChanged =
    !existingShipment || pickupAddress.id !== existingShipment.pickup_address_id;
  const deliveryAddressChanged =
    !existingShipment || deliveryAddress.id !== existingShipment.delivery_address_id;

  return {
    customer_id: customerId,
    pickup_address_id: pickupAddress.id,
    pickup_address_snapshot: resolveAddressSnapshot({
      payloadSnapshot: payload.pickup_address_snapshot,
      address: pickupAddress,
      existingSnapshot: existingShipment?.pickup_address_snapshot,
      addressChanged: pickupAddressChanged
    }),
    delivery_address_id: deliveryAddress.id,
    delivery_address_snapshot: resolveAddressSnapshot({
      payloadSnapshot: payload.delivery_address_snapshot,
      address: deliveryAddress,
      existingSnapshot: existingShipment?.delivery_address_snapshot,
      addressChanged: deliveryAddressChanged
    }),
    pickup_latitude:
      payload.pickup_latitude !== undefined
        ? toNullable(payload.pickup_latitude)
        : pickupAddressChanged
          ? toNullable(pickupAddress.latitude)
          : existingShipment?.pickup_latitude ?? toNullable(pickupAddress.latitude),
    pickup_longitude:
      payload.pickup_longitude !== undefined
        ? toNullable(payload.pickup_longitude)
        : pickupAddressChanged
          ? toNullable(pickupAddress.longitude)
          : existingShipment?.pickup_longitude ?? toNullable(pickupAddress.longitude),
    delivery_latitude:
      payload.delivery_latitude !== undefined
        ? toNullable(payload.delivery_latitude)
        : deliveryAddressChanged
          ? toNullable(deliveryAddress.latitude)
          : existingShipment?.delivery_latitude ?? toNullable(deliveryAddress.latitude),
    delivery_longitude:
      payload.delivery_longitude !== undefined
        ? toNullable(payload.delivery_longitude)
        : deliveryAddressChanged
          ? toNullable(deliveryAddress.longitude)
          : existingShipment?.delivery_longitude ?? toNullable(deliveryAddress.longitude),
    pickup_place_id:
      payload.pickup_place_id !== undefined
        ? toNullable(normalizeText(payload.pickup_place_id))
        : pickupAddressChanged
          ? null
          : existingShipment?.pickup_place_id ?? null,
    delivery_place_id:
      payload.delivery_place_id !== undefined
        ? toNullable(normalizeText(payload.delivery_place_id))
        : deliveryAddressChanged
          ? null
          : existingShipment?.delivery_place_id ?? null
  };
};

const buildShipmentCoordinatePair = ({ shipmentData, pickupAddress, deliveryAddress }) => {
  const pickupLatitude = resolveCoordinateValue(shipmentData.pickup_latitude ?? pickupAddress?.latitude);
  const pickupLongitude = resolveCoordinateValue(
    shipmentData.pickup_longitude ?? pickupAddress?.longitude
  );
  const deliveryLatitude = resolveCoordinateValue(
    shipmentData.delivery_latitude ?? deliveryAddress?.latitude
  );
  const deliveryLongitude = resolveCoordinateValue(
    shipmentData.delivery_longitude ?? deliveryAddress?.longitude
  );

  if (
    pickupLatitude === null ||
    pickupLongitude === null ||
    deliveryLatitude === null ||
    deliveryLongitude === null
  ) {
    throw new AppError(
      'Pickup and delivery coordinates are required to estimate shipment fare.',
      422
    );
  }

  return {
    pickup_coordinates: {
      latitude: pickupLatitude,
      longitude: pickupLongitude
    },
    delivery_coordinates: {
      latitude: deliveryLatitude,
      longitude: deliveryLongitude
    }
  };
};

const syncShipmentFareEstimation = async ({
  shipmentId,
  vehicleTypeId,
  shipmentData,
  pickupAddress,
  deliveryAddress,
  weightKg,
  transaction
}) => {
  await db.FareEstimation.destroy({
    where: { shipment_id: shipmentId },
    transaction
  });

  const coordinates = buildShipmentCoordinatePair({
    shipmentData,
    pickupAddress,
    deliveryAddress
  });

  const estimation = await pricingService.createShipmentFareEstimation(
    {
      shipmentId,
      vehicleTypeId,
      pickupCoordinates: coordinates.pickup_coordinates,
      deliveryCoordinates: coordinates.delivery_coordinates,
      weightKg
    },
    transaction
  );

  return estimation.estimation;
};

const getShipmentById = async (id, user) => {
  const accessContext = resolveAccessContext(user);
  const shipment = await db.Shipment.findByPk(id, {
    include: getShipmentIncludes(),
    order: [
      [{ model: db.ShipmentPackage, as: 'packages' }, 'created_at', 'ASC'],
      [{ model: db.ShipmentStatusHistory, as: 'statusHistory' }, 'created_at', 'ASC'],
      [{ model: db.ShipmentAttachment, as: 'attachments' }, 'created_at', 'DESC'],
      [{ model: db.ShipmentAssignment, as: 'assignments' }, 'assigned_at', 'DESC'],
      [{ model: db.ShipmentTrackingEvent, as: 'trackingEvents' }, 'recorded_at', 'DESC']
    ]
  });

  if (!shipment) {
    throw new AppError('Shipment not found.', 404);
  }

  ensureShipmentAccess(shipment, accessContext);
  return shipment;
};

const listShipments = async (query, user) => {
  const accessContext = resolveAccessContext(user);
  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 10), 100);
  const offset = (page - 1) * limit;
  const whereClause = buildShipmentFilters(query, accessContext);

  const { rows, count } = await db.Shipment.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: db.Customer,
        as: 'customer',
        attributes: ['id', 'customer_code', 'company_name', 'contact_person', 'phone', 'email', 'status']
      },
      {
        model: db.CustomerAddress,
        as: 'pickupAddress',
        attributes: ['id', 'city', 'state', 'country', 'pincode']
      },
      {
        model: db.CustomerAddress,
        as: 'deliveryAddress',
        attributes: ['id', 'city', 'state', 'country', 'pincode']
      },
      {
        model: db.VehicleType,
        as: 'vehicleType',
        attributes: ['id', 'type_name']
      }
    ],
    order: [['created_at', 'DESC']],
    distinct: true,
    subQuery: false
  });

  return {
    records: rows,
    pagination: buildPagination({ page, limit, totalRecords: count })
  };
};

const listMyShipments = async (query, user) => listShipments(query, user);

const getMyShipmentById = async (id, user) => getShipmentById(id, user);

const trackShipment = async (id, user) => getShipmentById(id, user);

const createShipment = async (payload, user) => {
  const accessContext = resolveAccessContext(user);
  const customerId = resolveCustomerId({
    requestedCustomerId: payload.customer_id,
    accessContext
  });

  if (!customerId) {
    throw new AppError('Customer is required to create a shipment.', 422);
  }

  validatePackageCollection(payload.packages);

  const relations = await validateShipmentRelations({
    customer_id: customerId,
    pickup_address_id: payload.pickup_address_id,
    delivery_address_id: payload.delivery_address_id,
    vehicle_type_id: payload.vehicle_type_id
  });

  const normalizedPackages = payload.packages.map(normalizePackage);
  const metrics = calculateShipmentMetrics(normalizedPackages);
  const transaction = await db.sequelize.transaction();

  try {
    const shipmentNumber = await generateShipmentNumber({
      sequelize: db.sequelize,
      transaction
    });

    const shipment = await db.Shipment.create(
      {
        shipment_number: shipmentNumber,
        vehicle_type_id: payload.vehicle_type_id,
        shipment_type: payload.shipment_type,
        priority: payload.priority || 'NORMAL',
        estimated_distance: null,
        estimated_delivery_date: toNullable(payload.estimated_delivery_date),
        special_instructions: toNullable(normalizeText(payload.special_instructions)),
        status: payload.status || 'DRAFT',
        cancelled_at: null,
        cancelled_by: null,
        cancellation_reason: null,
        created_by: accessContext.userId,
        created_by_customer_user_id: accessContext.customerUserId,
        ...buildShipmentPersistenceData({
          payload,
          customerId,
          pickupAddress: relations.pickupAddress,
          deliveryAddress: relations.deliveryAddress
        }),
        ...metrics
      },
      { transaction }
    );

    const fareEstimation = await syncShipmentFareEstimation({
      shipmentId: shipment.id,
      vehicleTypeId: payload.vehicle_type_id,
      shipmentData: shipment,
      pickupAddress: relations.pickupAddress,
      deliveryAddress: relations.deliveryAddress,
      weightKg: metrics.total_weight,
      transaction
    });

    await shipment.update(
      {
        estimated_distance: fareEstimation.distance_km
      },
      { transaction }
    );

    await db.ShipmentPackage.bulkCreate(
      normalizedPackages.map((pkg) => ({
        shipment_id: shipment.id,
        package_name: pkg.package_name,
        package_type: pkg.package_type,
        weight: pkg.weight,
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        quantity: pkg.quantity,
        declared_value: pkg.declared_value
      })),
      { transaction }
    );

    await appendStatusHistory({
      shipment_id: shipment.id,
      old_status: null,
      new_status: shipment.status,
      remarks: payload.status_remarks || 'Shipment created.',
      updated_by: accessContext.userId,
      updated_by_customer_user_id: accessContext.customerUserId,
      transaction
    });

    await transaction.commit();
    return getShipmentById(shipment.id, user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const syncShipmentPackages = async (shipmentId, packages, transaction) => {
  validatePackageCollection(packages);

  const normalizedPackages = packages.map(normalizePackage);
  const existingPackages = await db.ShipmentPackage.findAll({
    where: { shipment_id: shipmentId },
    transaction
  });
  const existingById = new Map(existingPackages.map((pkg) => [pkg.id, pkg]));
  const incomingIds = new Set(normalizedPackages.map((pkg) => pkg.id).filter(Boolean));

  await Promise.all(
    normalizedPackages.map(async (pkg) => {
      if (pkg.id && existingById.has(pkg.id)) {
        await existingById.get(pkg.id).update(
          {
            package_name: pkg.package_name,
            package_type: pkg.package_type,
            weight: pkg.weight,
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            quantity: pkg.quantity,
            declared_value: pkg.declared_value
          },
          { transaction }
        );
        return;
      }

      await db.ShipmentPackage.create(
        {
          shipment_id: shipmentId,
          package_name: pkg.package_name,
          package_type: pkg.package_type,
          weight: pkg.weight,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          quantity: pkg.quantity,
          declared_value: pkg.declared_value
        },
        { transaction }
      );
    })
  );

  const packagesToDelete = existingPackages
    .filter((pkg) => !incomingIds.has(pkg.id))
    .map((pkg) => pkg.id);

  if (packagesToDelete.length > 0) {
    await db.ShipmentPackage.destroy({
      where: {
        id: packagesToDelete
      },
      transaction
    });
  }

  return calculateShipmentMetrics(normalizedPackages);
};

const updateShipment = async (id, payload, user) => {
  const accessContext = resolveAccessContext(user);
  const shipment = await db.Shipment.findByPk(id);

  if (!shipment) {
    throw new AppError('Shipment not found.', 404);
  }

  ensureShipmentAccess(shipment, accessContext);
  ensureEditableShipment(shipment);

  const customerId = resolveCustomerId({
    requestedCustomerId: payload.customer_id,
    existingCustomerId: shipment.customer_id,
    accessContext
  });

  const nextPayload = {
    customer_id: customerId,
    pickup_address_id: payload.pickup_address_id ?? shipment.pickup_address_id,
    delivery_address_id: payload.delivery_address_id ?? shipment.delivery_address_id,
    vehicle_type_id: payload.vehicle_type_id ?? shipment.vehicle_type_id
  };

  const relations = await validateShipmentRelations(nextPayload);
  const transaction = await db.sequelize.transaction();

  try {
    let metrics = {
      package_count: shipment.package_count,
      total_weight: shipment.total_weight,
      total_volume: shipment.total_volume
    };

    if (payload.packages) {
      metrics = await syncShipmentPackages(id, payload.packages, transaction);
    }

    const nextShipmentPersistenceData = buildShipmentPersistenceData({
      payload: {
        ...payload,
        pickup_address_id: nextPayload.pickup_address_id,
        delivery_address_id: nextPayload.delivery_address_id
      },
      existingShipment: shipment,
      customerId,
      pickupAddress: relations.pickupAddress,
      deliveryAddress: relations.deliveryAddress
    });

    await shipment.update(
      {
        vehicle_type_id: nextPayload.vehicle_type_id,
        shipment_type: payload.shipment_type ?? shipment.shipment_type,
        priority: payload.priority ?? shipment.priority,
        estimated_distance: shipment.estimated_distance,
        estimated_delivery_date:
          payload.estimated_delivery_date === undefined
            ? shipment.estimated_delivery_date
            : toNullable(payload.estimated_delivery_date),
        special_instructions:
          payload.special_instructions === undefined
            ? shipment.special_instructions
            : toNullable(normalizeText(payload.special_instructions)),
        cancelled_at: shipment.cancelled_at,
        cancelled_by: shipment.cancelled_by,
        cancellation_reason: shipment.cancellation_reason,
        ...nextShipmentPersistenceData,
        ...metrics
      },
      { transaction }
    );

    const fareEstimation = await syncShipmentFareEstimation({
      shipmentId: shipment.id,
      vehicleTypeId: nextPayload.vehicle_type_id,
      shipmentData: {
        ...nextShipmentPersistenceData,
        ...metrics
      },
      pickupAddress: relations.pickupAddress,
      deliveryAddress: relations.deliveryAddress,
      weightKg: metrics.total_weight,
      transaction
    });

    await shipment.update(
      {
        estimated_distance: fareEstimation.distance_km
      },
      { transaction }
    );

    await transaction.commit();
    return getShipmentById(id, user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateShipmentStatus = async (id, status, remarks, user) => {
  const accessContext = resolveAccessContext(user);
  const shipment = await db.Shipment.findByPk(id);

  if (!shipment) {
    throw new AppError('Shipment not found.', 404);
  }

  ensureShipmentAccess(shipment, accessContext);

  if (status === 'CANCELLED') {
    throw new AppError('Use the cancel shipment endpoint to cancel shipments.', 409);
  }

  if (shipment.status === 'CANCELLED' && status !== 'CANCELLED') {
    throw new AppError('Cancelled shipments cannot be reassigned or reactivated.', 409);
  }

  if (shipment.status === 'DELIVERED') {
    throw new AppError('Delivered shipments cannot be updated.', 409);
  }

  if (shipment.status === status) {
    return getShipmentById(id, user);
  }

  const transaction = await db.sequelize.transaction();

  try {
    const previousStatus = shipment.status;
    await shipment.update({ status }, { transaction });
    await appendStatusHistory({
      shipment_id: id,
      old_status: previousStatus,
      new_status: status,
      remarks,
      updated_by: accessContext.userId,
      updated_by_customer_user_id: accessContext.customerUserId,
      transaction
    });

    await transaction.commit();
    return getShipmentById(id, user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const cancelShipment = async (id, remarks, user) => {
  const accessContext = resolveAccessContext(user);
  const shipment = await db.Shipment.findByPk(id);

  if (!shipment) {
    throw new AppError('Shipment not found.', 404);
  }

  ensureShipmentAccess(shipment, accessContext);

  if (shipment.status === 'CANCELLED') {
    return getShipmentById(id, user);
  }

  if (!CANCELLABLE_SHIPMENT_STATUSES.includes(shipment.status)) {
    throw new AppError(
      `Shipment can only be cancelled in statuses: ${CANCELLABLE_SHIPMENT_STATUSES.join(', ')}.`,
      409
    );
  }

  const transaction = await db.sequelize.transaction();

  try {
    const previousStatus = shipment.status;
    await shipment.update(
      {
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancelled_by: accessContext.userId,
        cancellation_reason: toNullable(normalizeText(remarks)) || 'Shipment cancelled.'
      },
      { transaction }
    );

    await appendStatusHistory({
      shipment_id: id,
      old_status: previousStatus,
      new_status: 'CANCELLED',
      remarks: toNullable(normalizeText(remarks)) || 'Shipment cancelled.',
      updated_by: accessContext.userId,
      updated_by_customer_user_id: accessContext.customerUserId,
      transaction
    });

    await transaction.commit();
    return getShipmentById(id, user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const normalizePackagesPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.packages)) {
    return payload.packages;
  }

  return [payload];
};

const createShipmentPackages = async (shipmentId, payload, user) => {
  const shipment = await getShipmentById(shipmentId, user);
  ensureEditableShipment(shipment);

  const newPackages = normalizePackagesPayload(payload).map(normalizePackage);
  const transaction = await db.sequelize.transaction();

  try {
    const createdPackages = await Promise.all(
      newPackages.map((pkg) =>
        db.ShipmentPackage.create(
          {
            shipment_id: shipmentId,
            package_name: pkg.package_name,
            package_type: pkg.package_type,
            weight: pkg.weight,
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            quantity: pkg.quantity,
            declared_value: pkg.declared_value
          },
          { transaction }
        )
      )
    );

    const allPackages = await db.ShipmentPackage.findAll({
      where: { shipment_id: shipmentId },
      transaction
    });
    const metrics = calculateShipmentMetrics(allPackages);
    await db.Shipment.update(metrics, {
      where: { id: shipmentId },
      transaction
    });
    await transaction.commit();

    return createdPackages;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const listShipmentPackages = async (shipmentId, user) => {
  await getShipmentById(shipmentId, user);

  return db.ShipmentPackage.findAll({
    where: { shipment_id: shipmentId },
    order: [['created_at', 'ASC']]
  });
};

const updateShipmentPackage = async (id, payload, user) => {
  const shipmentPackage = await db.ShipmentPackage.findByPk(id);

  if (!shipmentPackage) {
    throw new AppError('Shipment package not found.', 404);
  }

  const shipment = await getShipmentById(shipmentPackage.shipment_id, user);
  ensureEditableShipment(shipment);

  const transaction = await db.sequelize.transaction();

  try {
    const normalizedPackage = normalizePackage({
      ...shipmentPackage.toJSON(),
      ...payload,
      id
    });

    await shipmentPackage.update(
      {
        package_name: normalizedPackage.package_name,
        package_type: normalizedPackage.package_type,
        weight: normalizedPackage.weight,
        length: normalizedPackage.length,
        width: normalizedPackage.width,
        height: normalizedPackage.height,
        quantity: normalizedPackage.quantity,
        declared_value: normalizedPackage.declared_value
      },
      { transaction }
    );

    const allPackages = await db.ShipmentPackage.findAll({
      where: { shipment_id: shipment.id },
      transaction
    });
    const metrics = calculateShipmentMetrics(allPackages);
    await db.Shipment.update(metrics, {
      where: { id: shipment.id },
      transaction
    });

    await transaction.commit();
    return shipmentPackage;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteShipmentPackage = async (id, user) => {
  const shipmentPackage = await db.ShipmentPackage.findByPk(id);

  if (!shipmentPackage) {
    throw new AppError('Shipment package not found.', 404);
  }

  const shipment = await getShipmentById(shipmentPackage.shipment_id, user);
  ensureEditableShipment(shipment);

  const existingPackages = await db.ShipmentPackage.count({
    where: { shipment_id: shipment.id }
  });

  if (existingPackages <= 1) {
    throw new AppError('A shipment must have at least one package.', 422);
  }

  const transaction = await db.sequelize.transaction();

  try {
    await shipmentPackage.destroy({ transaction });
    const remainingPackages = await db.ShipmentPackage.findAll({
      where: { shipment_id: shipment.id },
      transaction
    });
    const metrics = calculateShipmentMetrics(remainingPackages);
    await db.Shipment.update(metrics, {
      where: { id: shipment.id },
      transaction
    });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createShipmentAttachment = async (shipmentId, payload, user) => {
  const shipment = await getShipmentById(shipmentId, user);
  ensureEditableShipment(shipment);

  const uploaded = await storageService.uploadFile({
    folder: `shipments/${shipmentId}/attachments`,
    filePayload: payload.file,
    allowedMimeTypes: ATTACHMENT_MIME_TYPES
  });

  try {
    return await db.ShipmentAttachment.create({
      shipment_id: shipmentId,
      file_name: payload.file.original_name,
      file_path: uploaded.path,
      file_type: payload.file.mime_type || 'application/octet-stream',
      uploaded_by: user.id
    });
  } catch (error) {
    await storageService.deleteFile(uploaded.path);
    throw error;
  }
};

const listShipmentAttachments = async (shipmentId, user) => {
  await getShipmentById(shipmentId, user);

  return db.ShipmentAttachment.findAll({
    where: { shipment_id: shipmentId },
    include: [
      {
        model: db.User,
        as: 'uploadedBy',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

const deleteShipmentAttachment = async (id, user) => {
  const attachment = await db.ShipmentAttachment.findByPk(id);

  if (!attachment) {
    throw new AppError('Shipment attachment not found.', 404);
  }

  const shipment = await getShipmentById(attachment.shipment_id, user);
  ensureEditableShipment(shipment);

  await attachment.destroy();
  await storageService.deleteFile(attachment.file_path);
};

const getShipmentDashboardStats = async (user = {}) => {
  const accessContext = resolveAccessContext(user);
  const whereClause = accessContext.customerId
    ? { customer_id: accessContext.customerId }
    : undefined;

  const [
    totalShipments,
    pendingAssignment,
    assigned,
    inTransit,
    delivered,
    cancelled,
    pricingMetrics
  ] = await Promise.all([
    db.Shipment.count({ where: whereClause }),
    db.Shipment.count({
      where: {
        ...whereClause,
        status: 'PENDING_ASSIGNMENT'
      }
    }),
    db.Shipment.count({
      where: {
        ...whereClause,
        status: 'ASSIGNED'
      }
    }),
    db.Shipment.count({
      where: {
        ...whereClause,
        status: {
          [Op.in]: ['DRIVER_ACCEPTED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']
        }
      }
    }),
    db.Shipment.count({
      where: {
        ...whereClause,
        status: 'DELIVERED'
      }
    }),
    db.Shipment.count({
      where: {
        ...whereClause,
        status: 'CANCELLED'
      }
    }),
    pricingService.getDashboardMetrics(user)
  ]);

  return {
    totalShipments,
    pendingAssignment,
    assigned,
    inTransit,
    delivered,
    cancelled,
    averageShipmentValue: pricingMetrics.averageShipmentValue,
    estimatedRevenue: pricingMetrics.estimatedRevenue
  };
};

module.exports = {
  SHIPMENT_TYPES,
  SHIPMENT_PRIORITIES,
  SHIPMENT_STATUSES,
  EDITABLE_SHIPMENT_STATUSES,
  CANCELLABLE_SHIPMENT_STATUSES,
  listShipments,
  listMyShipments,
  getShipmentById,
  getMyShipmentById,
  trackShipment,
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
