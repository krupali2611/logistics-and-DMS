require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { buildSequelizeOptions } = require('../src/config/sequelizeOptions');

const sharedConfig = {
  use_env_variable: 'DATABASE_URL',
  ...buildSequelizeOptions()
};

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig
};
