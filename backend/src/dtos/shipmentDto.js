const mapUserSummary = (user) =>
  user
    ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    : null;

const mapCustomerUserSummary = (user) =>
  user
    ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      }
    : null;

const mapCustomerSummary = (customer) =>
  customer
    ? {
        id: customer.id,
        customer_code: customer.customer_code,
        company_name: customer.company_name,
        contact_person: customer.contact_person,
        phone: customer.phone,
        email: customer.email,
        status: customer.status
      }
    : null;

const mapAddressSummary = (address) =>
  address
    ? {
        id: address.id,
        address_type: address.address_type,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode
      }
    : null;

const mapVehicleTypeSummary = (vehicleType) =>
  vehicleType
    ? {
        id: vehicleType.id,
        type_name: vehicleType.type_name,
        description: vehicleType.description,
        min_capacity: vehicleType.min_capacity,
        max_capacity: vehicleType.max_capacity,
        status: vehicleType.status
      }
    : null;

const mapPackage = (pkg) => ({
  id: pkg.id,
  package_name: pkg.package_name,
  package_type: pkg.package_type,
  weight: pkg.weight,
  length: pkg.length,
  width: pkg.width,
  height: pkg.height,
  quantity: pkg.quantity,
  declared_value: pkg.declared_value,
  created_at: pkg.created_at,
  updated_at: pkg.updated_at
});

const mapStatusHistory = (event) => ({
  id: event.id,
  old_status: event.old_status,
  new_status: event.new_status,
  remarks: event.remarks,
  created_at: event.created_at,
  updated_by: mapUserSummary(event.updatedBy),
  updated_by_customer_user: mapCustomerUserSummary(event.updatedByCustomerUser)
});

const mapAttachment = (attachment) => ({
  id: attachment.id,
  file_name: attachment.file_name,
  file_path: attachment.file_path,
  file_type: attachment.file_type,
  created_at: attachment.created_at,
  uploaded_by: mapUserSummary(attachment.uploadedBy)
});

const mapAssignment = (assignment) => ({
  id: assignment.id,
  assignment_type: assignment.assignment_type,
  status: assignment.status,
  is_active: assignment.is_active,
  assigned_at: assignment.assigned_at,
  accepted_at: assignment.accepted_at,
  rejected_at: assignment.rejected_at,
  completed_at: assignment.completed_at,
  cancelled_at: assignment.cancelled_at,
  auto_assignment_score: assignment.auto_assignment_score,
  rejection_reason: assignment.rejection_reason,
  notes: assignment.notes,
  driver: assignment.driver
    ? {
        id: assignment.driver.id,
        driver_code: assignment.driver.driver_code,
        first_name: assignment.driver.first_name,
        last_name: assignment.driver.last_name,
        phone: assignment.driver.phone,
        availability_status: assignment.driver.availability_status
      }
    : null,
  vehicle: assignment.vehicle
    ? {
        id: assignment.vehicle.id,
        vehicle_number: assignment.vehicle.vehicle_number,
        registration_number: assignment.vehicle.registration_number,
        availability_status: assignment.vehicle.availability_status
      }
    : null,
  assigned_by: mapUserSummary(assignment.assignedBy)
});

const mapTrackingEvent = (event) => ({
  id: event.id,
  latitude: event.latitude,
  longitude: event.longitude,
  location_label: event.location_label,
  status: event.status,
  eta: event.eta,
  source: event.source,
  notes: event.notes,
  recorded_at: event.recorded_at,
  recorded_by: mapUserSummary(event.recordedBy),
  assignment_id: event.shipment_assignment_id
});

const mapFareEstimation = (estimation) =>
  estimation
    ? {
        id: estimation.id,
        shipment_id: estimation.shipment_id,
        vehicle_type_id: estimation.vehicle_type_id,
        distance_km: estimation.distance_km,
        weight_kg: estimation.weight_kg,
        base_fare: estimation.base_fare,
        distance_charge: estimation.distance_charge,
        weight_charge: estimation.weight_charge,
        final_amount: estimation.final_amount,
        created_at: estimation.created_at,
        updated_at: estimation.updated_at
      }
    : null;

const mapShipmentBase = (shipment) => ({
  id: shipment.id,
  shipment_number: shipment.shipment_number,
  customer_id: shipment.customer_id,
  pickup_address_id: shipment.pickup_address_id,
  pickup_address_snapshot: shipment.pickup_address_snapshot,
  delivery_address_id: shipment.delivery_address_id,
  delivery_address_snapshot: shipment.delivery_address_snapshot,
  pickup_latitude: shipment.pickup_latitude,
  pickup_longitude: shipment.pickup_longitude,
  delivery_latitude: shipment.delivery_latitude,
  delivery_longitude: shipment.delivery_longitude,
  pickup_place_id: shipment.pickup_place_id,
  delivery_place_id: shipment.delivery_place_id,
  vehicle_type_id: shipment.vehicle_type_id,
  shipment_type: shipment.shipment_type,
  priority: shipment.priority,
  package_count: shipment.package_count,
  total_weight: shipment.total_weight,
  total_volume: shipment.total_volume,
  estimated_distance: shipment.estimated_distance,
  estimated_delivery_date: shipment.estimated_delivery_date,
  special_instructions: shipment.special_instructions,
  status: shipment.status,
  cancelled_at: shipment.cancelled_at,
  cancelled_by: shipment.cancelled_by,
  cancellation_reason: shipment.cancellation_reason,
  current_driver_latitude: shipment.current_driver_latitude,
  current_driver_longitude: shipment.current_driver_longitude,
  current_eta: shipment.current_eta,
  current_location_updated_at: shipment.current_location_updated_at,
  created_by: shipment.created_by,
  created_by_customer_user_id: shipment.created_by_customer_user_id,
  created_at: shipment.created_at,
  updated_at: shipment.updated_at
});

const toShipmentListDto = (shipment) => ({
  ...mapShipmentBase(shipment),
  customer: mapCustomerSummary(shipment.customer),
  pickup_address: mapAddressSummary(shipment.pickupAddress),
  delivery_address: mapAddressSummary(shipment.deliveryAddress),
  vehicle_type: mapVehicleTypeSummary(shipment.vehicleType)
});

const toShipmentDetailDto = (shipment) => ({
  ...toShipmentListDto(shipment),
  fare_estimation: mapFareEstimation(shipment.fareEstimation),
  created_by_user: mapUserSummary(shipment.createdBy),
  cancelled_by_user: mapUserSummary(shipment.cancelledBy),
  created_by_customer_user: mapCustomerUserSummary(shipment.createdByCustomerUser),
  packages: Array.isArray(shipment.packages) ? shipment.packages.map(mapPackage) : [],
  status_history: Array.isArray(shipment.statusHistory)
    ? shipment.statusHistory.map(mapStatusHistory)
    : [],
  attachments: Array.isArray(shipment.attachments)
    ? shipment.attachments.map(mapAttachment)
    : [],
  assignments: Array.isArray(shipment.assignments)
    ? shipment.assignments.map(mapAssignment)
    : []
});

const toShipmentTrackingDto = (shipment) => ({
  shipment: {
    id: shipment.id,
    shipment_number: shipment.shipment_number,
    status: shipment.status,
    customer_id: shipment.customer_id,
    current_driver_latitude: shipment.current_driver_latitude,
    current_driver_longitude: shipment.current_driver_longitude,
    current_eta: shipment.current_eta,
    current_location_updated_at: shipment.current_location_updated_at
  },
  active_assignment:
    Array.isArray(shipment.assignments) &&
    shipment.assignments.find((assignment) => assignment.is_active)
      ? mapAssignment(shipment.assignments.find((assignment) => assignment.is_active))
      : null,
  tracking_history: Array.isArray(shipment.trackingEvents)
    ? shipment.trackingEvents.map(mapTrackingEvent)
    : []
});

module.exports = {
  toShipmentListDto,
  toShipmentDetailDto,
  toShipmentTrackingDto
};
