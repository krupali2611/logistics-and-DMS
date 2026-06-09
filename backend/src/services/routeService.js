const AppError = require('../utils/AppError');
const etaService = require('./etaService');

const ROUTE_PROVIDERS = [
  'HAVERSINE',
  'GOOGLE_MAPS_DIRECTIONS',
  'GOOGLE_DISTANCE_MATRIX',
  'OPENSTREETMAP',
  'OPENROUTESERVICE',
  'MAPBOX'
];

const DEFAULT_PROVIDER = 'OPENROUTESERVICE';
const DEFAULT_SPEED_KMH = Number(process.env.ROUTE_FALLBACK_SPEED_KMH || 42);
const OPENROUTESERVICE_BASE_URL =
  process.env.OPENROUTESERVICE_BASE_URL || 'https://api.openrouteservice.org';
const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY || '';

const VEHICLE_ROUTE_STRATEGIES = {
  bike: {
    key: 'bike',
    label: 'Bike',
    openRouteServiceProfile: 'cycling-regular'
  },
  scooter: {
    key: 'scooter',
    label: 'Scooter',
    openRouteServiceProfile: 'driving-car'
  },
  mini_truck: {
    key: 'mini_truck',
    label: 'Mini Truck',
    openRouteServiceProfile: 'driving-hgv'
  },
  pickup: {
    key: 'pickup',
    label: 'Pickup',
    openRouteServiceProfile: 'driving-hgv'
  },
  truck: {
    key: 'truck',
    label: 'Truck',
    openRouteServiceProfile: 'driving-hgv'
  },
  container: {
    key: 'container',
    label: 'Container',
    openRouteServiceProfile: 'driving-hgv'
  },
  default: {
    key: 'default',
    label: 'Default',
    openRouteServiceProfile: 'driving-car'
  }
};

const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));
const roundCoordinate = (value) => Number(Number(value || 0).toFixed(6));

const normalizeCoordinate = (coordinates, label) => {
  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new AppError(`${label} latitude must be between -90 and 90.`, 422);
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new AppError(`${label} longitude must be between -180 and 180.`, 422);
  }

  return {
    latitude: roundCoordinate(latitude),
    longitude: roundCoordinate(longitude)
  };
};

const toRadians = (value) => (value * Math.PI) / 180;

const calculateHaversineDistanceKm = (origin, destination) => {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const buildLineStringGeometry = (origin, destination, meta = {}) => ({
  type: 'LineString',
  coordinates: [
    [origin.longitude, origin.latitude],
    [destination.longitude, destination.latitude]
  ],
  meta
});

const normalizeVehicleStrategyKey = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const resolveVehicleRoutingStrategy = ({ vehicleTypeKey, vehicleTypeName } = {}) => {
  const candidates = [
    normalizeVehicleStrategyKey(vehicleTypeKey),
    normalizeVehicleStrategyKey(vehicleTypeName)
  ].filter(Boolean);

  const directMatch = candidates.find((candidate) => VEHICLE_ROUTE_STRATEGIES[candidate]);
  if (directMatch) {
    return VEHICLE_ROUTE_STRATEGIES[directMatch];
  }

  const fuzzyMatch = candidates.find((candidate) =>
    Object.keys(VEHICLE_ROUTE_STRATEGIES).some(
      (strategyKey) => strategyKey !== 'default' && candidate.includes(strategyKey)
    )
  );

  if (fuzzyMatch) {
    const matchedStrategyKey = Object.keys(VEHICLE_ROUTE_STRATEGIES).find(
      (strategyKey) => strategyKey !== 'default' && fuzzyMatch.includes(strategyKey)
    );
    return VEHICLE_ROUTE_STRATEGIES[matchedStrategyKey];
  }

  return VEHICLE_ROUTE_STRATEGIES.default;
};

const buildRouteResult = ({
  provider,
  distanceKm,
  durationMinutes,
  departureAt,
  geometry,
  origin,
  destination,
  vehicleStrategy,
  meta = {}
}) => ({
  provider,
  distance_km: roundToTwo(distanceKm),
  duration_minutes: Math.max(0, Math.round(Number(durationMinutes || 0))),
  estimated_eta: etaService.calculateEstimatedEta({
    departureAt,
    durationMinutes
  }),
  geometry:
    geometry ||
    buildLineStringGeometry(origin, destination, {
      mode: 'fallback_straight_line'
    }),
  vehicle_strategy: {
    key: vehicleStrategy.key,
    label: vehicleStrategy.label,
    profile: vehicleStrategy.openRouteServiceProfile
  },
  meta
});

const haversineRouteProvider = async ({
  origin,
  destination,
  departureAt,
  vehicleStrategy
}) => {
  const distanceKm = calculateHaversineDistanceKm(origin, destination);
  const durationMinutes =
    distanceKm <= 0 ? 0 : Math.max(15, Math.round((distanceKm / DEFAULT_SPEED_KMH) * 60));

  return buildRouteResult({
    provider: 'HAVERSINE',
    distanceKm,
    durationMinutes,
    departureAt,
    geometry: buildLineStringGeometry(origin, destination, {
      mode: 'fallback_straight_line'
    }),
    origin,
    destination,
    vehicleStrategy,
    meta: {
      fallback: true
    }
  });
};

const fetchOpenRouteServiceRoute = async ({
  origin,
  destination,
  departureAt,
  vehicleStrategy
}) => {
  if (!OPENROUTESERVICE_API_KEY) {
    throw new AppError('OPENROUTESERVICE_API_KEY is not configured.', 503);
  }

  const profile = vehicleStrategy.openRouteServiceProfile;
  const response = await fetch(
    `${OPENROUTESERVICE_BASE_URL}/v2/directions/${profile}/geojson`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json, application/geo+json',
        'Content-Type': 'application/json',
        Authorization: OPENROUTESERVICE_API_KEY
      },
      body: JSON.stringify({
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude]
        ]
      })
    }
  );

  if (!response.ok) {
    throw new AppError(
      `OpenRouteService request failed with status ${response.status}.`,
      503
    );
  }

  const payload = await response.json();
  const feature = Array.isArray(payload.features) ? payload.features[0] : null;
  const summary = feature?.properties?.summary;

  if (!feature || !summary) {
    throw new AppError('OpenRouteService did not return a valid route response.', 503);
  }

  return buildRouteResult({
    provider: 'OPENROUTESERVICE',
    distanceKm: Number(summary.distance || 0) / 1000,
    durationMinutes: Number(summary.duration || 0) / 60,
    departureAt,
    geometry: feature.geometry,
    origin,
    destination,
    vehicleStrategy,
    meta: {
      profile
    }
  });
};

const notConfiguredProvider = (providerName) => async (context) => {
  const fallbackRoute = await haversineRouteProvider(context);
  return {
    ...fallbackRoute,
    provider: `${providerName}_FALLBACK`
  };
};

const providerRegistry = {
  HAVERSINE: haversineRouteProvider,
  GOOGLE_MAPS_DIRECTIONS: notConfiguredProvider('GOOGLE_MAPS_DIRECTIONS'),
  GOOGLE_DISTANCE_MATRIX: notConfiguredProvider('GOOGLE_DISTANCE_MATRIX'),
  OPENSTREETMAP: notConfiguredProvider('OPENSTREETMAP'),
  OPENROUTESERVICE: fetchOpenRouteServiceRoute,
  MAPBOX: notConfiguredProvider('MAPBOX')
};

const resolveProviderName = () => {
  const providerName = (process.env.ROUTE_PROVIDER || DEFAULT_PROVIDER).toUpperCase();
  return ROUTE_PROVIDERS.includes(providerName) ? providerName : DEFAULT_PROVIDER;
};

const calculateRoute = async ({
  pickup,
  delivery,
  departureAt = new Date(),
  vehicleTypeKey,
  vehicleTypeName
}) => {
  const origin = normalizeCoordinate(pickup, 'Pickup');
  const destination = normalizeCoordinate(delivery, 'Delivery');
  const vehicleStrategy = resolveVehicleRoutingStrategy({
    vehicleTypeKey,
    vehicleTypeName
  });
  const providerName = resolveProviderName();
  const provider = providerRegistry[providerName] || haversineRouteProvider;

  try {
    const route = await provider({
      origin,
      destination,
      departureAt,
      vehicleStrategy
    });

    return {
      ...route,
      provider: route.provider,
      distance_km: roundToTwo(route.distance_km),
      duration_minutes: Math.max(0, Math.round(Number(route.duration_minutes || 0))),
      geometry:
        route.geometry ||
        buildLineStringGeometry(origin, destination, {
          mode: 'fallback_straight_line'
        }),
      origin,
      destination
    };
  } catch (error) {
    const fallbackRoute = await haversineRouteProvider({
      origin,
      destination,
      departureAt,
      vehicleStrategy
    });

    return {
      ...fallbackRoute,
      provider: `${providerName}_FALLBACK`,
      meta: {
        ...(fallbackRoute.meta || {}),
        fallback_reason: error.message || 'Route provider unavailable.'
      },
      origin,
      destination
    };
  }
};

module.exports = {
  ROUTE_PROVIDERS,
  VEHICLE_ROUTE_STRATEGIES,
  resolveVehicleRoutingStrategy,
  calculateRoute
};
