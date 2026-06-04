'use strict';

const { seedDefaultAccessControl } = require('../src/seeders/defaultAdminSeeder');

module.exports = {
  async up(queryInterface) {
    await seedDefaultAccessControl(queryInterface);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('refresh_tokens', null, {});
    await queryInterface.bulkDelete('users', { email: (process.env.DEFAULT_ADMIN_EMAIL || 'admin@logistics.com').toLowerCase() }, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
