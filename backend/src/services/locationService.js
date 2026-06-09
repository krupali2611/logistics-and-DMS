const db = require('../models');
const AppError = require('../utils/AppError');
const {
  getCustomerAddressAttributes,
  getCustomerAddressSchema
} = require('../utils/customerAddressSchema');

const LOCATION_PROVIDERS = ['NOMINATIM', 'OPENSTREETMAP', 'GOOGLE_PLACES'];
const DEFAULT_PROVIDER = 'NOMINATIM';
const SEARCH_LIMIT = 8;
const USER_AGENT = process.env.LOCATION_USER_AGENT || 'logistics-dms/1.0';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const toNullable = (value) => (value === undefined || value === null || value === '' ? null : value);

const normalizeCoordinate = (value, label) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new AppError(`${label} must be a valid coordinate.`, 422);
  }

  return Number(numericValue.toFixed(7));
};

const buildFormattedAddress = (parts = []) =>
  parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join(', ');

const extractCity = (address = {}) =>
  normalizeText(
    address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.municipality ||
      address.county ||
      address.suburb
  );

const mapCustomerAddressToLocation = (address) => ({
  place_id: address.place_id || `saved:${address.id}`,
  address: address.formatted_address || buildFormattedAddress([
    address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.city,
    address.state,
    address.country,
    address.pincode
  ]),
  latitude: address.latitude === null ? null : Number(address.latitude),
  longitude: address.longitude === null ? null : Number(address.longitude),
  city: address.city || null,
  state: address.state || null,
  country: address.country || null,
  pincode: address.pincode || null,
  source: 'saved_address',
  saved_address_id: address.id,
  provider: 'CUSTOMER_ADDRESS_BOOK',
  is_favorite: Boolean(address.is_favorite),
  label: address.address_type
});

const normalizeLocationSnapshot = (payload = {}) => {
  const address = normalizeText(payload.address || payload.formatted_address || payload.full_address);
  if (!address) {
    throw new AppError('Location address is required.', 422);
  }

  return {
    address,
    latitude: normalizeCoordinate(payload.latitude, 'Latitude'),
    longitude: normalizeCoordinate(payload.longitude, 'Longitude'),
    place_id: toNullable(normalizeText(payload.place_id)),
    city: toNullable(normalizeText(payload.city)),
    state: toNullable(normalizeText(payload.state)),
    country: toNullable(normalizeText(payload.country)),
    pincode: toNullable(normalizeText(payload.pincode))
  };
};

const resolveProviderName = () => {
  const providerName = (process.env.LOCATION_PROVIDER || DEFAULT_PROVIDER).toUpperCase();
  if (providerName === 'OPENSTREETMAP') {
    return 'NOMINATIM';
  }
  return LOCATION_PROVIDERS.includes(providerName) ? providerName : DEFAULT_PROVIDER;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT
    }
  });

  if (!response.ok) {
    throw new AppError(`Location provider request failed with status ${response.status}.`, 503);
  }

  return response.json();
};

const toOpenStreetMapPlaceId = (item) => `osm:${item.osm_type}:${item.osm_id}`;

const mapOpenStreetMapItem = (item) => ({
  place_id: toOpenStreetMapPlaceId(item),
  address: normalizeText(item.display_name),
  latitude: item.lat === undefined ? null : Number(item.lat),
  longitude: item.lon === undefined ? null : Number(item.lon),
  city: extractCity(item.address),
  state: normalizeText(item.address?.state),
  country: normalizeText(item.address?.country),
  pincode: normalizeText(item.address?.postcode),
  provider: 'NOMINATIM',
  source: 'provider'
});

const nominatimProvider = {
  async search({ query, limit }) {
    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(limit)
    });
    const results = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    return Array.isArray(results) ? results.map(mapOpenStreetMapItem) : [];
  },

  async getPlaceDetails({ placeId, latitude, longitude }) {
    if (placeId) {
      const [, osmType, osmId] = String(placeId).split(':');
      if (!osmType || !osmId) {
        throw new AppError('Unsupported place_id format for OpenStreetMap lookup.', 422);
      }

      const params = new URLSearchParams({
        osm_ids: `${osmType[0].toUpperCase()}${osmId}`,
        format: 'jsonv2',
        addressdetails: '1'
      });
      const results = await fetchJson(`https://nominatim.openstreetmap.org/lookup?${params.toString()}`);
      if (!Array.isArray(results) || results.length === 0) {
        throw new AppError('Location not found for the provided place_id.', 404);
      }
      return mapOpenStreetMapItem(results[0]);
    }

    if (latitude === null || longitude === null) {
      throw new AppError('Either place_id or latitude/longitude is required.', 422);
    }

    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'jsonv2',
      addressdetails: '1'
    });
    const result = await fetchJson(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    return mapOpenStreetMapItem(result);
  }
};

const customerAddressProvider = {
  async search({ query, customerId, limit }) {
    if (!customerId) {
      return [];
    }

    const searchTerm = `%${query}%`;
    const { Op } = require('sequelize');
    const schema = await getCustomerAddressSchema(db.sequelize);
    const attributes = await getCustomerAddressAttributes(db.sequelize);
    const searchConditions = [
      { address_line_1: { [Op.iLike]: searchTerm } },
      { city: { [Op.iLike]: searchTerm } },
      { state: { [Op.iLike]: searchTerm } },
      { country: { [Op.iLike]: searchTerm } },
      { pincode: { [Op.iLike]: searchTerm } }
    ];

    if (schema.hasFormattedAddress) {
      searchConditions.unshift({ formatted_address: { [Op.iLike]: searchTerm } });
    } else {
      searchConditions.push({ address_line_2: { [Op.iLike]: searchTerm } });
      searchConditions.push({ landmark: { [Op.iLike]: searchTerm } });
    }

    const addresses = await db.CustomerAddress.findAll({
      where: {
        customer_id: customerId,
        [Op.or]: searchConditions
      },
      attributes,
      order: [
        ...(schema.hasIsFavorite ? [['is_favorite', 'DESC']] : []),
        ['is_default', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit
    });

    return addresses.map(mapCustomerAddressToLocation);
  },

  async getPlaceDetails({ placeId, customerId }) {
    if (!placeId?.startsWith('saved:')) {
      throw new AppError('Unsupported saved address place_id.', 422);
    }

    const addressId = placeId.replace('saved:', '');
    const attributes = await getCustomerAddressAttributes(db.sequelize);
    const address = await db.CustomerAddress.findOne({
      where: {
        id: addressId,
        ...(customerId ? { customer_id: customerId } : {})
      },
      attributes
    });

    if (!address) {
      throw new AppError('Saved address not found.', 404);
    }

    return mapCustomerAddressToLocation(address);
  }
};

const providerRegistry = {
  NOMINATIM: nominatimProvider,
  OPENSTREETMAP: nominatimProvider,
  CUSTOMER_ADDRESS_BOOK: customerAddressProvider
};

const resolveProvider = () => providerRegistry[resolveProviderName()] || nominatimProvider;

const mergeLocationResults = (savedResults, providerResults, limit) => {
  const seen = new Set();
  return [...savedResults, ...providerResults].filter((item) => {
    const key = `${item.place_id || ''}:${item.address || ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).slice(0, limit);
};

const searchLocations = async ({ query, customerId = null, limit = SEARCH_LIMIT }) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery || normalizedQuery.length < 3) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || SEARCH_LIMIT, 1), 10);
  const savedResults = await customerAddressProvider.search({
    query: normalizedQuery,
    customerId,
    limit: safeLimit
  });

  try {
    const providerResults = await resolveProvider().search({
      query: normalizedQuery,
      customerId,
      limit: safeLimit
    });
    return mergeLocationResults(savedResults, providerResults, safeLimit);
  } catch (error) {
    return savedResults;
  }
};

const getPlaceDetails = async ({ placeId = null, latitude = null, longitude = null, customerId = null }) => {
  if (placeId?.startsWith('saved:')) {
    return customerAddressProvider.getPlaceDetails({ placeId, customerId });
  }

  return resolveProvider().getPlaceDetails({
    placeId,
    latitude: normalizeCoordinate(latitude, 'Latitude'),
    longitude: normalizeCoordinate(longitude, 'Longitude'),
    customerId
  });
};

const saveCustomerAddress = async ({
  customerId,
  location,
  addressType = 'OTHER',
  isDefault = false,
  isFavorite = false
}) => {
  const customer = await db.Customer.findByPk(customerId);
  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  const snapshot = normalizeLocationSnapshot(location);
  const schema = await getCustomerAddressSchema(db.sequelize);
  const createPayload = {
    customer_id: customerId,
    address_type: addressType,
    address_line_1: snapshot.address.slice(0, 255),
    address_line_2: null,
    landmark: null,
    city: snapshot.city || 'Unknown',
    state: snapshot.state || 'Unknown',
    country: snapshot.country || 'Unknown',
    pincode: snapshot.pincode || 'NA',
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    is_default: Boolean(isDefault),
    ...(schema.hasPlaceId ? { place_id: snapshot.place_id } : {}),
    ...(schema.hasFormattedAddress ? { formatted_address: snapshot.address } : {}),
    ...(schema.hasIsFavorite ? { is_favorite: Boolean(isFavorite) } : {})
  };
  const address = await db.CustomerAddress.create(createPayload);

  return mapCustomerAddressToLocation(address);
};

module.exports = {
  buildFormattedAddress,
  normalizeLocationSnapshot,
  searchLocations,
  getPlaceDetails,
  saveCustomerAddress,
  mapCustomerAddressToLocation
};
