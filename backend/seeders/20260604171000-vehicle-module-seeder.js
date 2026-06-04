'use strict';

const { v4: uuidv4 } = require('uuid');
const {
  VEHICLE_TYPES
} = require('../src/constants/vehicleConstants');

const VEHICLE_PERMISSIONS = [
  'vehicle_view',
  'vehicle_create',
  'vehicle_update',
  'vehicle_delete',
  'vehicle_verify',
  'vehicle_assign'
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissions = VEHICLE_PERMISSIONS.map((name) => ({
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

    if (superAdminRole) {
      const [persistedPermissions] = await queryInterface.sequelize.query(
        `SELECT id, name FROM permissions WHERE name IN (${VEHICLE_PERMISSIONS.map((_, index) => `:permission${index}`).join(', ')})`,
        {
          replacements: VEHICLE_PERMISSIONS.reduce((acc, permission, index) => {
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
    }

    const vehicleTypes = VEHICLE_TYPES.map((typeName) => ({
      id: uuidv4(),
      type_name: typeName,
      description: `${typeName} logistics vehicle type`,
      min_capacity: null,
      max_capacity: null,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    }));

    const [existingVehicleTypes] = await queryInterface.sequelize.query(
      'SELECT type_name FROM vehicle_types'
    );
    const existingTypeNames = new Set(existingVehicleTypes.map((item) => item.type_name));
    const vehicleTypesToInsert = vehicleTypes.filter(
      (item) => !existingTypeNames.has(item.type_name)
    );

    if (vehicleTypesToInsert.length > 0) {
      await queryInterface.bulkInsert('vehicle_types', vehicleTypesToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'vehicle_types',
      {
        type_name: VEHICLE_TYPES
      },
      {}
    );

    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE name IN (
          'vehicle_view',
          'vehicle_create',
          'vehicle_update',
          'vehicle_delete',
          'vehicle_verify',
          'vehicle_assign'
        )
      )
    `);

    await queryInterface.bulkDelete(
      'permissions',
      {
        name: VEHICLE_PERMISSIONS
      },
      {}
    );
  }
};
