const sequelize = require('../config/database');
const RoleModel = require('./Role');
const PermissionModel = require('./Permission');
const UserModel = require('./User');
const UserRoleModel = require('./UserRole');
const RolePermissionModel = require('./RolePermission');
const RefreshTokenModel = require('./RefreshToken');

const db = {};

db.sequelize = sequelize;
db.Role = RoleModel(sequelize);
db.Permission = PermissionModel(sequelize);
db.User = UserModel(sequelize);
db.UserRole = UserRoleModel(sequelize);
db.RolePermission = RolePermissionModel(sequelize);
db.RefreshToken = RefreshTokenModel(sequelize);

db.User.belongsToMany(db.Role, {
  through: db.UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

db.Role.belongsToMany(db.User, {
  through: db.UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

db.Role.belongsToMany(db.Permission, {
  through: db.RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

db.Permission.belongsToMany(db.Role, {
  through: db.RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

db.User.hasMany(db.RefreshToken, {
  foreignKey: 'user_id',
  as: 'refresh_tokens'
});

db.RefreshToken.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = db;
