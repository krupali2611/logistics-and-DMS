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
const VehicleAssignmentModel = require('./VehicleAssignment');
const CustomerModel = require('./Customer');
const CustomerUserModel = require('./CustomerUser');
const CustomerRefreshTokenModel = require('./CustomerRefreshToken');
const CustomerOtpModel = require('./CustomerOtp');
const CustomerAddressModel = require('./CustomerAddress');
const CustomerDocumentModel = require('./CustomerDocument');
const CustomerNoteModel = require('./CustomerNote');
const AuditLogModel = require('./AuditLog');
const ShipmentModel = require('./Shipment');
const ShipmentPackageModel = require('./ShipmentPackage');
const ShipmentStatusHistoryModel = require('./ShipmentStatusHistory');
const ShipmentAttachmentModel = require('./ShipmentAttachment');
const ShipmentAssignmentModel = require('./ShipmentAssignment');
const ShipmentTrackingEventModel = require('./ShipmentTrackingEvent');
const PricingRuleModel = require('./PricingRule');
const FareEstimationModel = require('./FareEstimation');

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
db.VehicleAssignment = VehicleAssignmentModel(sequelize);
db.Customer = CustomerModel(sequelize);
db.CustomerUser = CustomerUserModel(sequelize);
db.CustomerRefreshToken = CustomerRefreshTokenModel(sequelize);
db.CustomerOtp = CustomerOtpModel(sequelize);
db.CustomerAddress = CustomerAddressModel(sequelize);
db.CustomerDocument = CustomerDocumentModel(sequelize);
db.CustomerNote = CustomerNoteModel(sequelize);
db.AuditLog = AuditLogModel(sequelize);
db.Shipment = ShipmentModel(sequelize);
db.ShipmentPackage = ShipmentPackageModel(sequelize);
db.ShipmentStatusHistory = ShipmentStatusHistoryModel(sequelize);
db.ShipmentAttachment = ShipmentAttachmentModel(sequelize);
db.ShipmentAssignment = ShipmentAssignmentModel(sequelize);
db.ShipmentTrackingEvent = ShipmentTrackingEventModel(sequelize);
db.PricingRule = PricingRuleModel(sequelize);
db.FareEstimation = FareEstimationModel(sequelize);

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

db.Vehicle.belongsTo(db.Driver, {
  foreignKey: 'assigned_driver_id',
  as: 'assignedDriver'
});

db.Driver.hasOne(db.Vehicle, {
  foreignKey: 'assigned_driver_id',
  as: 'currentVehicle'
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

db.Driver.hasMany(db.VehicleAssignment, {
  foreignKey: 'driver_id',
  as: 'vehicleAssignmentHistory'
});

db.VehicleAssignment.belongsTo(db.Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

db.Vehicle.hasMany(db.VehicleAssignment, {
  foreignKey: 'vehicle_id',
  as: 'assignmentHistory'
});

db.VehicleAssignment.belongsTo(db.Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

db.User.hasMany(db.VehicleAssignment, {
  foreignKey: 'assigned_by',
  as: 'vehicleAssignmentsCreated'
});

db.VehicleAssignment.belongsTo(db.User, {
  foreignKey: 'assigned_by',
  as: 'assignedBy'
});

db.User.hasMany(db.AuditLog, {
  foreignKey: 'performed_by',
  as: 'auditLogs'
});

db.AuditLog.belongsTo(db.User, {
  foreignKey: 'performed_by',
  as: 'performedBy'
});

db.Customer.hasMany(db.CustomerAddress, {
  foreignKey: 'customer_id',
  as: 'addresses'
});

db.Customer.hasMany(db.CustomerUser, {
  foreignKey: 'customer_id',
  as: 'users'
});

db.CustomerUser.belongsTo(db.Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.CustomerUser.hasMany(db.CustomerRefreshToken, {
  foreignKey: 'customer_user_id',
  as: 'refreshTokens'
});

db.CustomerRefreshToken.belongsTo(db.CustomerUser, {
  foreignKey: 'customer_user_id',
  as: 'customerUser'
});

db.CustomerUser.hasMany(db.CustomerOtp, {
  foreignKey: 'customer_user_id',
  as: 'otps'
});

db.CustomerOtp.belongsTo(db.CustomerUser, {
  foreignKey: 'customer_user_id',
  as: 'customerUser'
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

db.Customer.hasMany(db.Shipment, {
  foreignKey: 'customer_id',
  as: 'shipments'
});

db.Shipment.belongsTo(db.Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.CustomerAddress.hasMany(db.Shipment, {
  foreignKey: 'pickup_address_id',
  as: 'pickupShipments'
});

db.Shipment.belongsTo(db.CustomerAddress, {
  foreignKey: 'pickup_address_id',
  as: 'pickupAddress'
});

db.CustomerAddress.hasMany(db.Shipment, {
  foreignKey: 'delivery_address_id',
  as: 'deliveryShipments'
});

db.Shipment.belongsTo(db.CustomerAddress, {
  foreignKey: 'delivery_address_id',
  as: 'deliveryAddress'
});

db.VehicleType.hasMany(db.Shipment, {
  foreignKey: 'vehicle_type_id',
  as: 'shipments'
});

db.Shipment.belongsTo(db.VehicleType, {
  foreignKey: 'vehicle_type_id',
  as: 'vehicleType'
});

db.User.hasMany(db.Shipment, {
  foreignKey: 'created_by',
  as: 'createdShipments'
});

db.Shipment.belongsTo(db.User, {
  foreignKey: 'created_by',
  as: 'createdBy'
});

db.User.hasMany(db.Shipment, {
  foreignKey: 'cancelled_by',
  as: 'cancelledShipments'
});

db.Shipment.belongsTo(db.User, {
  foreignKey: 'cancelled_by',
  as: 'cancelledBy'
});

db.CustomerUser.hasMany(db.Shipment, {
  foreignKey: 'created_by_customer_user_id',
  as: 'createdShipments'
});

db.Shipment.belongsTo(db.CustomerUser, {
  foreignKey: 'created_by_customer_user_id',
  as: 'createdByCustomerUser'
});

db.Shipment.hasMany(db.ShipmentPackage, {
  foreignKey: 'shipment_id',
  as: 'packages'
});

db.ShipmentPackage.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

db.Shipment.hasMany(db.ShipmentStatusHistory, {
  foreignKey: 'shipment_id',
  as: 'statusHistory'
});

db.ShipmentStatusHistory.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

db.User.hasMany(db.ShipmentStatusHistory, {
  foreignKey: 'updated_by',
  as: 'shipmentStatusUpdates'
});

db.ShipmentStatusHistory.belongsTo(db.User, {
  foreignKey: 'updated_by',
  as: 'updatedBy'
});

db.CustomerUser.hasMany(db.ShipmentStatusHistory, {
  foreignKey: 'updated_by_customer_user_id',
  as: 'shipmentStatusUpdates'
});

db.ShipmentStatusHistory.belongsTo(db.CustomerUser, {
  foreignKey: 'updated_by_customer_user_id',
  as: 'updatedByCustomerUser'
});

db.Shipment.hasMany(db.ShipmentAttachment, {
  foreignKey: 'shipment_id',
  as: 'attachments'
});

db.ShipmentAttachment.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

db.User.hasMany(db.ShipmentAttachment, {
  foreignKey: 'uploaded_by',
  as: 'shipmentAttachments'
});

db.ShipmentAttachment.belongsTo(db.User, {
  foreignKey: 'uploaded_by',
  as: 'uploadedBy'
});

db.Shipment.hasMany(db.ShipmentAssignment, {
  foreignKey: 'shipment_id',
  as: 'assignments'
});

db.ShipmentAssignment.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

db.Driver.hasMany(db.ShipmentAssignment, {
  foreignKey: 'driver_id',
  as: 'shipmentAssignments'
});

db.ShipmentAssignment.belongsTo(db.Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

db.Vehicle.hasMany(db.ShipmentAssignment, {
  foreignKey: 'vehicle_id',
  as: 'shipmentAssignments'
});

db.ShipmentAssignment.belongsTo(db.Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

db.User.hasMany(db.ShipmentAssignment, {
  foreignKey: 'assigned_by',
  as: 'shipmentAssignmentsCreated'
});

db.ShipmentAssignment.belongsTo(db.User, {
  foreignKey: 'assigned_by',
  as: 'assignedBy'
});

db.Shipment.hasMany(db.ShipmentTrackingEvent, {
  foreignKey: 'shipment_id',
  as: 'trackingEvents'
});

db.ShipmentTrackingEvent.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

db.ShipmentAssignment.hasMany(db.ShipmentTrackingEvent, {
  foreignKey: 'shipment_assignment_id',
  as: 'trackingEvents'
});

db.ShipmentTrackingEvent.belongsTo(db.ShipmentAssignment, {
  foreignKey: 'shipment_assignment_id',
  as: 'assignment'
});

db.User.hasMany(db.ShipmentTrackingEvent, {
  foreignKey: 'recorded_by',
  as: 'shipmentTrackingEvents'
});

db.ShipmentTrackingEvent.belongsTo(db.User, {
  foreignKey: 'recorded_by',
  as: 'recordedBy'
});

db.VehicleType.hasOne(db.PricingRule, {
  foreignKey: 'vehicle_type_id',
  as: 'pricingRule'
});

db.PricingRule.belongsTo(db.VehicleType, {
  foreignKey: 'vehicle_type_id',
  as: 'vehicleType'
});

db.VehicleType.hasMany(db.FareEstimation, {
  foreignKey: 'vehicle_type_id',
  as: 'fareEstimations'
});

db.FareEstimation.belongsTo(db.VehicleType, {
  foreignKey: 'vehicle_type_id',
  as: 'vehicleType'
});

db.Shipment.hasOne(db.FareEstimation, {
  foreignKey: 'shipment_id',
  as: 'fareEstimation'
});

db.FareEstimation.belongsTo(db.Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});

module.exports = db;
