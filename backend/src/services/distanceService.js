const AppError = require('../utils/AppError');
const { DISTANCE_PROVIDERS } = require('../constants/pricingConstants');

const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));

const normalizeCoordinate = (coordinates, label) => {
  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new AppError(`${label} latitude must be between -90 and 90.`, 422);
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new AppError(`${label} longitude must be between -180 and 180.`, 422);
  }

  return { latitude, longitude };
};

const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceProvider = async ({ origin, destination }) => {
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
  return {
    distance_km: roundToTwo(earthRadiusKm * c),
    provider: 'HAVERSINE'
  };
};

const notConfiguredProvider = (providerName) => async () => {
  throw new AppError(
    `${providerName} distance provider is not configured yet. Switch DISTANCE_PROVIDER to HAVERSINE until external API credentials are added.`,
    503
  );
};

const providerRegistry = {
  HAVERSINE: haversineDistanceProvider,
  GOOGLE_MAPS: notConfiguredProvider('Google Maps Distance Matrix API'),
  OPENROUTESERVICE: notConfiguredProvider('OpenRouteService'),
  OPENSTREETMAP: notConfiguredProvider('OpenStreetMap')
};

const resolveProvider = () => {
  const providerName = (process.env.DISTANCE_PROVIDER || 'HAVERSINE').toUpperCase();
  return DISTANCE_PROVIDERS.includes(providerName) ? providerName : 'HAVERSINE';
};

const calculateDistance = async ({ pickup, delivery }) => {
  const origin = normalizeCoordinate(pickup, 'Pickup');
  const destination = normalizeCoordinate(delivery, 'Delivery');
  const providerName = resolveProvider();
  const provider = providerRegistry[providerName];

  return provider({ origin, destination });
};

module.exports = {
  calculateDistance,
  DISTANCE_PROVIDERS
};
