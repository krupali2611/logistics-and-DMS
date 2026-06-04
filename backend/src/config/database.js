require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const { Sequelize } = require('sequelize');
const { buildSequelizeOptions } = require('./sequelizeOptions');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Configure your Supabase PostgreSQL connection in backend/.env.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, buildSequelizeOptions());

module.exports = sequelize;
