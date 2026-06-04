'use strict';

const { seedDefaultAccessControl } = require('../src/seeders/defaultAdminSeeder');

module.exports = {
  async up(queryInterface) {
    await seedDefaultAccessControl(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE name = 'driver_verify'
      )
    `);

    await queryInterface.bulkDelete('permissions', { name: 'driver_verify' }, {});
  }
};
