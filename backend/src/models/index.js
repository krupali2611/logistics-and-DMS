const sequelize = require('../config/database');
const RoleModel = require('./Role');
const PermissionModel = require('./Permission');
const UserModel = require('./User');
const UserRoleModel = require('./UserRole');
const RolePermissionModel = require('./RolePermission');
const RefreshTokenModel = require('./RefreshToken');
const DriverModel = require('./Driver');
const DriverDocumentModel = require('./DriverDocument');
const DriverLocationModel = require('./DriverLocation');
const VehicleTypeModel = require('./VehicleType');
const VehicleModel = require('./Vehicle');
const VehicleDocumentModel = require('./VehicleDocument');
const DriverVehicleAssignmentModel = require('./DriverVehicleAssignment');
const CustomerModel = require('./Customer');
const CustomerAddressModel = require('./CustomerAddress');
const CustomerDocumentModel = require('./CustomerDocument');
const CustomerNoteModel = require('./CustomerNote');

const db = {};

db.sequelize = sequelize;
db.Role = RoleModel(sequelize);
db.Permission = PermissionModel(sequelize);
db.User = UserModel(sequelize);
db.UserRole = UserRoleModel(sequelize);
db.RolePermission = RolePermissionModel(sequelize);
db.RefreshToken = RefreshTokenModel(sequelize);
db.Driver = DriverModel(sequelize);
db.DriverDocument = DriverDocumentModel(sequelize);
db.DriverLocation = DriverLocationModel(sequelize);
db.VehicleType = VehicleTypeModel(sequelize);
db.Vehicle = VehicleModel(sequelize);
db.VehicleDocument = VehicleDocumentModel(sequelize);
db.DriverVehicleAssignment = DriverVehicleAssignmentModel(sequelize);
db.Customer = CustomerModel(sequelize);
db.CustomerAddress = CustomerAddressModel(sequelize);
db.CustomerDocument = CustomerDocumentModel(sequelize);
db.CustomerNote = CustomerNoteModel(sequelize);

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

db.Driver.hasMany(db.DriverDocument, {
  foreignKey: 'driver_id',
  as: 'documents'
});

db.DriverDocument.belongsTo(db.Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

db.Driver.hasOne(db.DriverLocation, {
  foreignKey: 'driver_id',
  as: 'location'
});

db.DriverLocation.belongsTo(db.Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

db.VehicleType.hasMany(db.Vehicle, {
  foreignKey: 'vehicle_type_id',
  as: 'vehicles'
});

db.Vehicle.belongsTo(db.VehicleType, {
  foreignKey: 'vehicle_type_id',
  as: 'vehicleType'
});

db.Vehicle.hasMany(db.VehicleDocument, {
  foreignKey: 'vehicle_id',
  as: 'documents'
});

db.VehicleDocument.belongsTo(db.Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

db.Driver.hasMany(db.DriverVehicleAssignment, {
  foreignKey: 'driver_id',
  as: 'vehicleAssignments'
});

db.DriverVehicleAssignment.belongsTo(db.Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

db.Vehicle.hasMany(db.DriverVehicleAssignment, {
  foreignKey: 'vehicle_id',
  as: 'assignments'
});

db.DriverVehicleAssignment.belongsTo(db.Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

db.Customer.hasMany(db.CustomerAddress, {
  foreignKey: 'customer_id',
  as: 'addresses'
});

db.CustomerAddress.belongsTo(db.Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.Customer.hasMany(db.CustomerDocument, {
  foreignKey: 'customer_id',
  as: 'documents'
});

db.CustomerDocument.belongsTo(db.Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.Customer.hasMany(db.CustomerNote, {
  foreignKey: 'customer_id',
  as: 'notes'
});

db.CustomerNote.belongsTo(db.Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.User.hasMany(db.CustomerNote, {
  foreignKey: 'created_by',
  as: 'customerNotes'
});

db.CustomerNote.belongsTo(db.User, {
  foreignKey: 'created_by',
  as: 'createdBy'
});

module.exports = db;
