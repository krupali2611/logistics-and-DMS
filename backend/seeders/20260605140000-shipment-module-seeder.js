'use strict';

const { v4: uuidv4 } = require('uuid');

const SHIPMENT_PERMISSIONS = [
  'shipment_view',
  'shipment_create',
  'shipment_update',
  'shipment_cancel',
  'shipment_status_update'
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissions = SHIPMENT_PERMISSIONS.map((name) => ({
      id: uuidv4(),
      name,
      description: `${name.replace(/_/g, ' ')} permission`,
      created_at: now,
      updated_at: now
    }));

    const [existingPermissions] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions'
    );
    const existingPermissionNames = new Set(existingPermissions.map((permission) => permission.name));
    const permissionsToInsert = permissions.filter(
      (permission) => !existingPermissionNames.has(permission.name)
    );

    if (permissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('permissions', permissionsToInsert);
    }

    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, name FROM roles WHERE name = 'Super Admin'"
    );
    const superAdminRole = roles[0];

    if (!superAdminRole) {
      return;
    }

    const [persistedPermissions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions WHERE name IN (${SHIPMENT_PERMISSIONS.map((_, index) => `:permission${index}`).join(', ')})`,
      {
        replacements: SHIPMENT_PERMISSIONS.reduce((accumulator, permission, index) => {
          accumulator[`permission${index}`] = permission;
          return accumulator;
        }, {})
      }
    );

    const [existingRolePermissions] = await queryInterface.sequelize.query(
      'SELECT role_id, permission_id FROM role_permissions WHERE role_id = :roleId',
      {
        replacements: { roleId: superAdminRole.id }
      }
    );
    const existingRolePermissionKeys = new Set(
      existingRolePermissions.map((item) => `${item.role_id}:${item.permission_id}`)
    );

    const rolePermissionsToInsert = persistedPermissions
      .map((permission) => ({
        id: uuidv4(),
        role_id: superAdminRole.id,
        permission_id: permission.id,
        created_at: now,
        updated_at: now
      }))
      .filter((item) => !existingRolePermissionKeys.has(`${item.role_id}:${item.permission_id}`));

    if (rolePermissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE name IN (
          'shipment_view',
          'shipment_create',
          'shipment_update',
          'shipment_cancel',
          'shipment_status_update'
        )
      )
    `);

    await queryInterface.bulkDelete(
      'permissions',
      {
        name: SHIPMENT_PERMISSIONS
      },
      {}
    );
  }
};
