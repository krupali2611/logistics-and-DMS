'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      ALTER COLUMN pickup_address_id DROP NOT NULL,
      ALTER COLUMN delivery_address_id DROP NOT NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      DROP CONSTRAINT IF EXISTS shipments_pickup_address_id_fkey,
      DROP CONSTRAINT IF EXISTS shipments_delivery_address_id_fkey
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      ADD CONSTRAINT shipments_pickup_address_id_fkey
        FOREIGN KEY (pickup_address_id)
        REFERENCES customer_addresses(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      ADD CONSTRAINT shipments_delivery_address_id_fkey
        FOREIGN KEY (delivery_address_id)
        REFERENCES customer_addresses(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      DROP CONSTRAINT IF EXISTS shipments_pickup_address_id_fkey,
      DROP CONSTRAINT IF EXISTS shipments_delivery_address_id_fkey
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      ALTER COLUMN pickup_address_id SET NOT NULL,
      ALTER COLUMN delivery_address_id SET NOT NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE shipments
      ADD CONSTRAINT shipments_pickup_address_id_fkey
        FOREIGN KEY (pickup_address_id)
        REFERENCES customer_addresses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      ADD CONSTRAINT shipments_delivery_address_id_fkey
        FOREIGN KEY (delivery_address_id)
        REFERENCES customer_addresses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    `);
  }
};
