'use strict';

const { v4: uuidv4 } = require('uuid');

const CUSTOMER_PERMISSIONS = [
  'customer_view',
  'customer_create',
  'customer_update',
  'customer_delete',
  'customer_verify'
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissions = CUSTOMER_PERMISSIONS.map((name) => ({
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
      `SELECT id, name FROM permissions WHERE name IN (${CUSTOMER_PERMISSIONS.map((_, index) => `:permission${index}`).join(', ')})`,
      {
        replacements: CUSTOMER_PERMISSIONS.reduce((acc, permission, index) => {
          acc[`permission${index}`] = permission;
          return acc;
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
          'customer_view',
          'customer_create',
          'customer_update',
          'customer_delete',
          'customer_verify'
        )
      )
    `);

    await queryInterface.bulkDelete(
      'permissions',
      {
        name: CUSTOMER_PERMISSIONS
      },
      {}
    );
  }
};
