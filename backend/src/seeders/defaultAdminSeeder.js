const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const DEFAULT_PERMISSIONS = [
  'user_view',
  'user_create',
  'user_update',
  'user_delete',
  'driver_view',
  'driver_create',
  'driver_update',
  'driver_delete',
  'driver_verify',
  'vehicle_view',
  'vehicle_create',
  'vehicle_update',
  'vehicle_delete',
  'vehicle_verify',
  'vehicle_assign',
  'customer_view',
  'customer_create',
  'customer_update',
  'customer_delete',
  'customer_verify',
  'shipment_view',
  'shipment_create',
  'shipment_update',
  'shipment_delete',
  'dashboard_view'
];

const seedDefaultAccessControl = async (queryInterface) => {
  const now = new Date();
  const roles = [
    {
      id: uuidv4(),
      name: 'Super Admin',
      description: 'Full system administrator with all permissions.',
      status: true,
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      name: 'Admin',
      description: 'Administrative user with configurable permissions.',
      status: true,
      created_at: now,
      updated_at: now
    }
  ];

  const [existingRoles] = await queryInterface.sequelize.query(
    "SELECT name FROM roles WHERE name IN ('Super Admin', 'Admin')"
  );
  const existingRoleNames = new Set(existingRoles.map((role) => role.name));

  const rolesToInsert = roles.filter((role) => !existingRoleNames.has(role.name));
  if (rolesToInsert.length > 0) {
    await queryInterface.bulkInsert('roles', rolesToInsert);
  }

  const permissions = DEFAULT_PERMISSIONS.map((name) => ({
    id: uuidv4(),
    name,
    description: `${name.replace(/_/g, ' ')} permission`,
    created_at: now,
    updated_at: now
  }));

  const [existingPermissions] = await queryInterface.sequelize.query(
    'SELECT name FROM permissions'
  );
  const existingPermissionNames = new Set(existingPermissions.map((permission) => permission.name));

  const permissionsToInsert = permissions.filter(
    (permission) => !existingPermissionNames.has(permission.name)
  );
  if (permissionsToInsert.length > 0) {
    await queryInterface.bulkInsert('permissions', permissionsToInsert);
  }

  const [persistedRoles] = await queryInterface.sequelize.query(
    "SELECT id, name FROM roles WHERE name IN ('Super Admin', 'Admin')"
  );
  const [persistedPermissions] = await queryInterface.sequelize.query(
    'SELECT id, name FROM permissions'
  );

  const superAdminRole = persistedRoles.find((role) => role.name === 'Super Admin');
  const superAdminPermissions = persistedPermissions.map((permission) => ({
    id: uuidv4(),
    role_id: superAdminRole.id,
    permission_id: permission.id,
    created_at: now,
    updated_at: now
  }));

  const [existingRolePermissions] = await queryInterface.sequelize.query(
    'SELECT role_id, permission_id FROM role_permissions'
  );
  const existingRolePermissionKeys = new Set(
    existingRolePermissions.map((item) => `${item.role_id}:${item.permission_id}`)
  );

  const rolePermissionsToInsert = superAdminPermissions.filter(
    (item) => !existingRolePermissionKeys.has(`${item.role_id}:${item.permission_id}`)
  );
  if (rolePermissionsToInsert.length > 0) {
    await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert);
  }

  const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@logistics.com').toLowerCase();
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  const [existingAdmin] = await queryInterface.sequelize.query(
    'SELECT id FROM users WHERE email = :email',
    {
      replacements: { email: defaultAdminEmail }
    }
  );

  let adminUserId = existingAdmin[0]?.id;

  if (!adminUserId) {
    adminUserId = uuidv4();
    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,
        first_name: 'System',
        last_name: 'Administrator',
        email: defaultAdminEmail,
        phone: '+910000000000',
        password: hashedPassword,
        status: true,
        last_login: null,
        created_at: now,
        updated_at: now
      }
    ]);
  }

  const [existingUserRoles] = await queryInterface.sequelize.query(
    'SELECT user_id, role_id FROM user_roles WHERE user_id = :userId AND role_id = :roleId',
    {
      replacements: { userId: adminUserId, roleId: superAdminRole.id }
    }
  );

  if (existingUserRoles.length === 0) {
    await queryInterface.bulkInsert('user_roles', [
      {
        id: uuidv4(),
        user_id: adminUserId,
        role_id: superAdminRole.id,
        created_at: now,
        updated_at: now
      }
    ]);
  }
};

module.exports = {
  seedDefaultAccessControl
};
