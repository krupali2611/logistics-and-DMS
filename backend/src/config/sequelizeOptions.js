const buildSequelizeOptions = () => ({
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 60000),
    idle: Number(process.env.DB_POOL_IDLE || 10000),
    evict: Number(process.env.DB_POOL_EVICT || 1000)
  },
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = {
  buildSequelizeOptions
};
