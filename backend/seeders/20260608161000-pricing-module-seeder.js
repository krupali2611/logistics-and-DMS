'use strict';

const { v4: uuidv4 } = require('uuid');

const PRICING_PERMISSIONS = [
  'pricing_view',
  'pricing_create',
  'pricing_update',
  'pricing_delete'
];

const DEFAULT_PRICING_BY_VEHICLE = {
  Bike: { base_fare: 40, per_km_rate: 8, per_kg_rate: 1, minimum_fare: 50 },
  Scooter: { base_fare: 50, per_km_rate: 10, per_kg_rate: 1, minimum_fare: 60 },
  'Mini Truck': { base_fare: 150, per_km_rate: 18, per_kg_rate: 2, minimum_fare: 200 },
  Pickup: { base_fare: 250, per_km_rate: 22, per_kg_rate: 3, minimum_fare: 300 },
  Truck: { base_fare: 600, per_km_rate: 35, per_kg_rate: 5, minimum_fare: 800 },
  Container: { base_fare: 1200, per_km_rate: 55, per_kg_rate: 8, minimum_fare: 1500 }
};

const DEFAULT_PRICING_ALIASES = {
  'Tata Ace': 'Mini Truck',
  '3 Wheeler': 'Mini Truck'
};

const resolveDefaultPricingForVehicle = (typeName) =>
  DEFAULT_PRICING_BY_VEHICLE[typeName] ||
  DEFAULT_PRICING_BY_VEHICLE[DEFAULT_PRICING_ALIASES[typeName]] ||
  null;

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const permissions = PRICING_PERMISSIONS.map((name) => ({
      id: uuidv4(),
      name,
      description: `${name.replace(/_/g, ' ')} permission`,
      created_at: now,
      updated_at: now
    }));

    const [existingPermissions] = await queryInterface.sequelize.query('SELECT id, name FROM permissions');
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
        `SELECT id, name FROM permissions WHERE name IN (${PRICING_PERMISSIONS.map((_, index) => `:permission${index}`).join(', ')})`,
        {
          replacements: PRICING_PERMISSIONS.reduce((accumulator, permission, index) => {
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
    }

    const [existingRules] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS count FROM pricing_rules'
    );

    if (existingRules[0]?.count > 0) {
      return;
    }

    const [vehicleTypes] = await queryInterface.sequelize.query(
      'SELECT id, type_name FROM vehicle_types'
    );

    const pricingRules = vehicleTypes
      .map((vehicleType) => {
        const defaultPricing = resolveDefaultPricingForVehicle(vehicleType.type_name);

        if (!defaultPricing) {
          return null;
        }

        return {
        id: uuidv4(),
        vehicle_type_id: vehicleType.id,
        ...defaultPricing,
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
        };
      })
      .filter(Boolean);

    if (pricingRules.length > 0) {
      await queryInterface.bulkInsert('pricing_rules', pricingRules);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pricing_rules', null, {});

    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE name IN (
          'pricing_view',
          'pricing_create',
          'pricing_update',
          'pricing_delete'
        )
      )
    `);

    await queryInterface.bulkDelete(
      'permissions',
      {
        name: PRICING_PERMISSIONS
      },
      {}
    );
  }
};
