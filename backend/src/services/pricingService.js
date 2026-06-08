const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const distanceService = require('./distanceService');
const { PRICING_RULE_STATUSES } = require('../constants/pricingConstants');

const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const buildRuleFilters = ({ status, vehicle_type_id, search } = {}) => {
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (vehicle_type_id) {
    whereClause.vehicle_type_id = vehicle_type_id;
  }

  if (search) {
    whereClause[Op.or] = [
      { '$vehicleType.type_name$': { [Op.iLike]: `%${search.trim()}%` } },
      { '$vehicleType.description$': { [Op.iLike]: `%${search.trim()}%` } }
    ];
  }

  return whereClause;
};

const getPricingRuleInclude = () => [
  {
    model: db.VehicleType,
    as: 'vehicleType',
    attributes: ['id', 'type_name', 'description', 'status']
  }
];

const getPricingRuleById = async (id) => {
  const pricingRule = await db.PricingRule.findByPk(id, {
    include: getPricingRuleInclude()
  });

  if (!pricingRule) {
    throw new AppError('Pricing rule not found.', 404);
  }

  return pricingRule;
};

const ensureVehicleTypeExists = async (vehicleTypeId) => {
  const vehicleType = await db.VehicleType.findByPk(vehicleTypeId);

  if (!vehicleType) {
    throw new AppError('Vehicle type not found.', 404);
  }

  return vehicleType;
};

const validatePricingAmounts = (payload) => {
  const baseFare = Number(payload.base_fare);
  const perKmRate = Number(payload.per_km_rate);
  const perKgRate = Number(payload.per_kg_rate);
  const minimumFare = Number(payload.minimum_fare);

  if ([baseFare, perKmRate, perKgRate, minimumFare].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new AppError('Pricing amounts must be valid numbers greater than or equal to 0.', 422);
  }

  return {
    base_fare: roundToTwo(baseFare),
    per_km_rate: roundToTwo(perKmRate),
    per_kg_rate: roundToTwo(perKgRate),
    minimum_fare: roundToTwo(minimumFare)
  };
};

const listPricingRules = async (query = {}) =>
  db.PricingRule.findAll({
    where: buildRuleFilters(query),
    include: getPricingRuleInclude(),
    order: [[{ model: db.VehicleType, as: 'vehicleType' }, 'type_name', 'ASC']]
  });

const getActivePricingRuleForVehicleType = async (vehicleTypeId, transaction) => {
  const pricingRule = await db.PricingRule.findOne({
    where: {
      vehicle_type_id: vehicleTypeId,
      status: 'ACTIVE'
    },
    include: getPricingRuleInclude(),
    transaction
  });

  if (!pricingRule) {
    throw new AppError('No active pricing rule found for the selected vehicle type.', 422);
  }

  return pricingRule;
};

const createPricingRule = async (payload) => {
  await ensureVehicleTypeExists(payload.vehicle_type_id);
  const amounts = validatePricingAmounts(payload);

  const pricingRule = await db.PricingRule.create({
    vehicle_type_id: payload.vehicle_type_id,
    ...amounts,
    status: payload.status || 'ACTIVE'
  });

  return getPricingRuleById(pricingRule.id);
};

const updatePricingRule = async (id, payload) => {
  const pricingRule = await getPricingRuleById(id);

  if (payload.vehicle_type_id) {
    await ensureVehicleTypeExists(payload.vehicle_type_id);
  }

  const amounts = validatePricingAmounts({
    base_fare: payload.base_fare ?? pricingRule.base_fare,
    per_km_rate: payload.per_km_rate ?? pricingRule.per_km_rate,
    per_kg_rate: payload.per_kg_rate ?? pricingRule.per_kg_rate,
    minimum_fare: payload.minimum_fare ?? pricingRule.minimum_fare
  });

  await pricingRule.update({
    vehicle_type_id: payload.vehicle_type_id ?? pricingRule.vehicle_type_id,
    ...amounts,
    status: payload.status ?? pricingRule.status
  });

  return getPricingRuleById(id);
};

const deletePricingRule = async (id) => {
  const pricingRule = await getPricingRuleById(id);
  await pricingRule.destroy();
};

const buildFareBreakdown = ({ pricingRule, distanceKm, weightKg }) => {
  const baseFare = roundToTwo(pricingRule.base_fare);
  const distanceCharge = roundToTwo(distanceKm * Number(pricingRule.per_km_rate));
  const weightCharge = roundToTwo(weightKg * Number(pricingRule.per_kg_rate));
  const computedAmount = roundToTwo(baseFare + distanceCharge + weightCharge);
  const minimumFare = roundToTwo(pricingRule.minimum_fare);
  const finalAmount = Math.max(computedAmount, minimumFare);

  return {
    base_fare: baseFare,
    distance_charge: distanceCharge,
    weight_charge: weightCharge,
    minimum_fare: minimumFare,
    final_amount: roundToTwo(finalAmount),
    applied_minimum_fare: finalAmount > computedAmount
  };
};

const createFareEstimationRecord = async (
  { shipmentId = null, vehicleTypeId, distanceKm, weightKg, fareBreakdown },
  transaction
) =>
  db.FareEstimation.create(
    {
      shipment_id: shipmentId,
      vehicle_type_id: vehicleTypeId,
      distance_km: roundToTwo(distanceKm),
      weight_kg: roundToTwo(weightKg),
      base_fare: fareBreakdown.base_fare,
      distance_charge: fareBreakdown.distance_charge,
      weight_charge: fareBreakdown.weight_charge,
      final_amount: fareBreakdown.final_amount
    },
    { transaction }
  );

const estimateFare = async (payload, options = {}) => {
  const vehicleType = await ensureVehicleTypeExists(payload.vehicle_type_id);
  const pricingRule = await getActivePricingRuleForVehicleType(payload.vehicle_type_id, options.transaction);
  const distanceResult = await distanceService.calculateDistance({
    pickup: payload.pickup_coordinates,
    delivery: payload.delivery_coordinates
  });

  const weightKg = roundToTwo(payload.weight);
  if (weightKg <= 0) {
    throw new AppError('Weight must be greater than 0.', 422);
  }

  const fareBreakdown = buildFareBreakdown({
    pricingRule,
    distanceKm: distanceResult.distance_km,
    weightKg
  });

  const estimation = await createFareEstimationRecord(
    {
      shipmentId: options.shipment_id || null,
      vehicleTypeId: payload.vehicle_type_id,
      distanceKm: distanceResult.distance_km,
      weightKg,
      fareBreakdown
    },
    options.transaction
  );

  return {
    estimation,
    pricing_rule: pricingRule,
    vehicle_type: vehicleType,
    distance: {
      km: distanceResult.distance_km,
      provider: distanceResult.provider
    },
    fare_breakdown: fareBreakdown
  };
};

const createShipmentFareEstimation = async (
  { shipmentId, vehicleTypeId, pickupCoordinates, deliveryCoordinates, weightKg },
  transaction
) =>
  estimateFare(
    {
      vehicle_type_id: vehicleTypeId,
      pickup_coordinates: pickupCoordinates,
      delivery_coordinates: deliveryCoordinates,
      weight: weightKg
    },
    {
      shipment_id: shipmentId,
      transaction
    }
  );

const getDashboardMetrics = async (user = {}) => {
  const shipmentWhere = user?.customer_id ? { customer_id: user.customer_id } : undefined;
  const fareWhere = {
    shipment_id: {
      [Op.ne]: null
    },
    ...(user?.customer_id
      ? {
          '$shipment.customer_id$': user.customer_id
        }
      : {})
  };

  const shipmentCount = await db.Shipment.count({ where: shipmentWhere });
  const estimations = await db.FareEstimation.findAll({
    where: fareWhere,
    include: [
      {
        model: db.Shipment,
        as: 'shipment',
        attributes: []
      }
    ],
    attributes: ['final_amount']
  });

  const totalAmount = estimations.reduce(
    (sum, estimation) => sum + Number(estimation.final_amount || 0),
    0
  );

  return {
    averageShipmentValue: shipmentCount ? roundToTwo(totalAmount / shipmentCount) : 0,
    estimatedRevenue: roundToTwo(totalAmount)
  };
};

const mapPricingRuleDto = (pricingRule) => ({
  id: pricingRule.id,
  vehicle_type_id: pricingRule.vehicle_type_id,
  base_fare: pricingRule.base_fare,
  per_km_rate: pricingRule.per_km_rate,
  per_kg_rate: pricingRule.per_kg_rate,
  minimum_fare: pricingRule.minimum_fare,
  status: pricingRule.status,
  created_at: pricingRule.created_at,
  updated_at: pricingRule.updated_at,
  vehicle_type: pricingRule.vehicleType
    ? {
        id: pricingRule.vehicleType.id,
        type_name: pricingRule.vehicleType.type_name,
        description: pricingRule.vehicleType.description,
        status: pricingRule.vehicleType.status
      }
    : null
});

const mapFareEstimationDto = (estimation, context = {}) => ({
  id: estimation.id,
  shipment_id: estimation.shipment_id,
  vehicle_type_id: estimation.vehicle_type_id,
  distance_km: estimation.distance_km,
  weight_kg: estimation.weight_kg,
  base_fare: estimation.base_fare,
  distance_charge: estimation.distance_charge,
  weight_charge: estimation.weight_charge,
  final_amount: estimation.final_amount,
  created_at: estimation.created_at,
  updated_at: estimation.updated_at,
  distance: context.distance || undefined,
  fare_breakdown: context.fare_breakdown || {
    base_fare: estimation.base_fare,
    distance_charge: estimation.distance_charge,
    weight_charge: estimation.weight_charge,
    final_amount: estimation.final_amount
  },
  pricing_rule: context.pricing_rule
    ? {
        id: context.pricing_rule.id,
        base_fare: context.pricing_rule.base_fare,
        per_km_rate: context.pricing_rule.per_km_rate,
        per_kg_rate: context.pricing_rule.per_kg_rate,
        minimum_fare: context.pricing_rule.minimum_fare,
        status: context.pricing_rule.status
      }
    : undefined,
  vehicle_type: context.vehicle_type
    ? {
        id: context.vehicle_type.id,
        type_name: normalizeText(context.vehicle_type.type_name)
      }
    : undefined
});

module.exports = {
  PRICING_RULE_STATUSES,
  listPricingRules,
  getPricingRuleById,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  estimateFare,
  createShipmentFareEstimation,
  getDashboardMetrics,
  mapPricingRuleDto,
  mapFareEstimationDto
};
