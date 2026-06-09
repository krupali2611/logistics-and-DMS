const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const routeService = require('./routeService');
const { PRICING_RULE_STATUSES } = require('../constants/pricingConstants');

const DEFAULT_PRICING_BY_VEHICLE = {
  Bike: { base_fare: 40, per_km_rate: 8, per_kg_rate: 1, minimum_fare: 50 },
  Scooter: { base_fare: 50, per_km_rate: 10, per_kg_rate: 1, minimum_fare: 60 },
  'Mini Truck': { base_fare: 150, per_km_rate: 18, per_kg_rate: 2, minimum_fare: 200 },
  Pickup: { base_fare: 250, per_km_rate: 22, per_kg_rate: 3, minimum_fare: 300 },
  Truck: { base_fare: 600, per_km_rate: 35, per_kg_rate: 5, minimum_fare: 800 },
  Container: { base_fare: 1200, per_km_rate: 55, per_kg_rate: 8, minimum_fare: 1500 }
};

const DEFAULT_PRICING_ALIASES = {
  tata_ace: 'Mini Truck',
  '3_wheeler': 'Mini Truck'
};

const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const normalizeVehicleKey = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const resolveDefaultPricingForVehicleType = (vehicleTypeName) => {
  if (DEFAULT_PRICING_BY_VEHICLE[vehicleTypeName]) {
    return DEFAULT_PRICING_BY_VEHICLE[vehicleTypeName];
  }

  const normalizedKey = normalizeVehicleKey(vehicleTypeName);
  const aliasTarget = DEFAULT_PRICING_ALIASES[normalizedKey];

  return aliasTarget ? DEFAULT_PRICING_BY_VEHICLE[aliasTarget] || null : null;
};

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
  {
    await ensureDefaultPricingRules();

    return db.PricingRule.findAll({
      where: buildRuleFilters(query),
      include: getPricingRuleInclude(),
      order: [[{ model: db.VehicleType, as: 'vehicleType' }, 'type_name', 'ASC']]
    });
  };

const ensureDefaultPricingRules = async (transaction) => {
  const vehicleTypes = await db.VehicleType.findAll({
    transaction
  });

  await Promise.all(
    vehicleTypes.map(async (vehicleType) => {
      const existingRule = await db.PricingRule.findOne({
        where: {
          vehicle_type_id: vehicleType.id
        },
        transaction
      });

      if (existingRule) {
        return;
      }

      const defaultRule = resolveDefaultPricingForVehicleType(vehicleType.type_name);
      if (!defaultRule) {
        return;
      }

      await db.PricingRule.create(
        {
          vehicle_type_id: vehicleType.id,
          ...defaultRule,
          status: 'ACTIVE'
        },
        { transaction }
      );
    })
  );
};

const getActivePricingRuleForVehicleType = async (vehicleTypeId, transaction) => {
  await ensureDefaultPricingRules(transaction);

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
  const perKmRate = roundToTwo(pricingRule.per_km_rate);
  const perKgRate = roundToTwo(pricingRule.per_kg_rate);
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
    computed_amount: computedAmount,
    final_amount: roundToTwo(finalAmount),
    applied_minimum_fare: finalAmount > computedAmount,
    formula: `max(${baseFare} + (${roundToTwo(distanceKm)} x ${perKmRate}) + (${roundToTwo(weightKg)} x ${perKgRate}), ${minimumFare})`
  };
};

const createFareEstimationRecord = async (
  { shipmentId = null, vehicleTypeId, distanceKm, weightKg, fareBreakdown },
  transaction
) => {
  if (!shipmentId) {
    return {
      id: null,
      shipment_id: null,
      vehicle_type_id: vehicleTypeId,
      distance_km: roundToTwo(distanceKm),
      weight_kg: roundToTwo(weightKg),
      base_fare: fareBreakdown.base_fare,
      distance_charge: fareBreakdown.distance_charge,
      weight_charge: fareBreakdown.weight_charge,
      final_amount: fareBreakdown.final_amount,
      created_at: null,
      updated_at: null
    };
  }

  return db.FareEstimation.create(
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
};

const estimateFare = async (payload, options = {}) => {
  const vehicleType =
    options.vehicleType || (await ensureVehicleTypeExists(payload.vehicle_type_id));
  const pricingRule =
    options.pricingRule ||
    (await getActivePricingRuleForVehicleType(payload.vehicle_type_id, options.transaction));
  const routeResult =
    options.routeResult ||
    (await routeService.calculateRoute({
      pickup: payload.pickup_coordinates,
      delivery: payload.delivery_coordinates,
      departureAt: options.departureAt || new Date(),
      vehicleTypeName: options.vehicleTypeName || vehicleType.type_name
    }));

  const weightKg = roundToTwo(payload.weight);
  if (weightKg <= 0) {
    throw new AppError('Weight must be greater than 0.', 422);
  }

  const fareBreakdown = buildFareBreakdown({
    pricingRule,
    distanceKm: routeResult.distance_km,
    weightKg
  });

  const estimation = await createFareEstimationRecord(
    {
      shipmentId: options.shipment_id || null,
      vehicleTypeId: payload.vehicle_type_id,
      distanceKm: routeResult.distance_km,
      weightKg,
      fareBreakdown
    },
    options.transaction
  );

  console.info(
    '[PricingEngine] Fare estimated',
    JSON.stringify({
      selectedVehicleType: normalizeText(vehicleType.type_name),
      pricingRuleId: pricingRule.id,
      distanceKm: roundToTwo(routeResult.distance_km),
      appliedFormula: fareBreakdown.formula,
      finalFare: fareBreakdown.final_amount
    })
  );

  return {
    estimation,
    pricing_rule: pricingRule,
    vehicle_type: vehicleType,
    distance: {
      km: routeResult.distance_km,
      provider: routeResult.provider
    },
    route: routeResult,
    fare_breakdown: fareBreakdown,
    debug: {
      distance_source: routeResult.provider,
      route_distance_km: roundToTwo(routeResult.distance_km),
      vehicle_type: normalizeText(vehicleType.type_name),
      pricing_rule_id: pricingRule.id,
      pricing_rule_status: pricingRule.status,
      base_fare: roundToTwo(pricingRule.base_fare),
      per_km_rate: roundToTwo(pricingRule.per_km_rate),
      per_kg_rate: roundToTwo(pricingRule.per_kg_rate),
      minimum_fare: roundToTwo(pricingRule.minimum_fare),
      weight_kg: weightKg,
      formula: fareBreakdown.formula,
      final_amount: fareBreakdown.final_amount
    }
  };
};

const createShipmentFareEstimation = async (
  {
    shipmentId,
    vehicleTypeId,
    pickupCoordinates,
    deliveryCoordinates,
    weightKg,
    routeResult,
    vehicleTypeName
  },
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
      transaction,
      routeResult,
      vehicleTypeName
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
  route: context.route
    ? {
        provider: context.route.provider,
        distance_km: context.route.distance_km,
        duration_minutes: context.route.duration_minutes,
        estimated_eta: context.route.estimated_eta,
        geometry: context.route.geometry
      }
    : undefined,
  fare_breakdown: context.fare_breakdown || {
    base_fare: estimation.base_fare,
    distance_charge: estimation.distance_charge,
    weight_charge: estimation.weight_charge,
    minimum_fare: context.pricing_rule ? roundToTwo(context.pricing_rule.minimum_fare) : 0,
    computed_amount: roundToTwo(
      Number(estimation.base_fare || 0) +
        Number(estimation.distance_charge || 0) +
        Number(estimation.weight_charge || 0)
    ),
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
    : undefined,
  debug:
    context.debug ||
    (context.pricing_rule || context.route || context.vehicle_type
      ? {
          distance_source: context.route?.provider,
          route_distance_km: context.route?.distance_km ?? estimation.distance_km,
          vehicle_type: context.vehicle_type?.type_name,
          pricing_rule_id: context.pricing_rule?.id,
          pricing_rule_status: context.pricing_rule?.status,
          base_fare: context.pricing_rule?.base_fare ?? estimation.base_fare,
          per_km_rate: context.pricing_rule?.per_km_rate,
          per_kg_rate: context.pricing_rule?.per_kg_rate,
          minimum_fare: context.pricing_rule?.minimum_fare,
          weight_kg: estimation.weight_kg,
          formula:
            context.fare_breakdown?.formula ||
            (context.pricing_rule
              ? `max(${roundToTwo(context.pricing_rule.base_fare)} + (${roundToTwo(
                  context.route?.distance_km ?? estimation.distance_km
                )} x ${roundToTwo(context.pricing_rule.per_km_rate)}) + (${roundToTwo(
                  estimation.weight_kg
                )} x ${roundToTwo(context.pricing_rule.per_kg_rate)}), ${roundToTwo(
                  context.pricing_rule.minimum_fare
                )})`
              : undefined),
          final_amount: estimation.final_amount
        }
      : undefined)
});

module.exports = {
  PRICING_RULE_STATUSES,
  DEFAULT_PRICING_BY_VEHICLE,
  ensureDefaultPricingRules,
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
