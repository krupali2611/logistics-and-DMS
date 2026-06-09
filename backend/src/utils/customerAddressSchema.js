let customerAddressSchemaPromise = null;

const loadCustomerAddressSchema = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();
  const tableDefinition = await queryInterface.describeTable('customer_addresses');

  return {
    hasPlaceId: Boolean(tableDefinition.place_id),
    hasFormattedAddress: Boolean(tableDefinition.formatted_address),
    hasIsFavorite: Boolean(tableDefinition.is_favorite)
  };
};

const getCustomerAddressSchema = async (sequelize) => {
  if (!customerAddressSchemaPromise) {
    customerAddressSchemaPromise = loadCustomerAddressSchema(sequelize).catch((error) => {
      customerAddressSchemaPromise = null;
      throw error;
    });
  }

  return customerAddressSchemaPromise;
};

const getCustomerAddressAttributes = async (sequelize) => {
  const schema = await getCustomerAddressSchema(sequelize);
  const attributes = [
    'id',
    'customer_id',
    'address_type',
    'address_line_1',
    'address_line_2',
    'landmark',
    'city',
    'state',
    'country',
    'pincode',
    'latitude',
    'longitude',
    'is_default',
    'created_at',
    'updated_at'
  ];

  if (schema.hasPlaceId) {
    attributes.push('place_id');
  }

  if (schema.hasFormattedAddress) {
    attributes.push('formatted_address');
  }

  if (schema.hasIsFavorite) {
    attributes.push('is_favorite');
  }

  return attributes;
};

module.exports = {
  getCustomerAddressSchema,
  getCustomerAddressAttributes
};
