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
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        place_id: address.place_id,
        formatted_address: address.formatted_address,
        is_favorite: address.is_favorite
      }
    : null;

const mapShipmentLocation = (shipment, prefix) => {
  const savedAddress = prefix === 'pickup' ? shipment.pickupAddress : shipment.deliveryAddress;
  return {
    address: shipment[`${prefix}_address`],
    address_snapshot: shipment[`${prefix}_address_snapshot`],
    latitude: shipment[`${prefix}_latitude`],
    longitude: shipment[`${prefix}_longitude`],
    place_id: shipment[`${prefix}_place_id`],
    city: shipment[`${prefix}_city`],
    state: shipment[`${prefix}_state`],
    country: shipment[`${prefix}_country`],
    pincode: shipment[`${prefix}_pincode`],
    saved_address_id: shipment[`${prefix}_address_id`],
    saved_address: mapAddressSummary(savedAddress)
  };
};

const mapVehicleTypeSummary = (vehicleType) =>
  vehicleType
    ? {
        id: vehicleType.id,
        type_name: vehicleType.type_name,
        description: vehicleType.description,
        min_capacity: vehicleType.min_capacity,
        max_capacity: vehicleType.max_capacity,
        status: vehicleType.status,
        pricing_rule: vehicleType.pricingRule
          ? {
              id: vehicleType.pricingRule.id,
              base_fare: vehicleType.pricingRule.base_fare,
              per_km_rate: vehicleType.pricingRule.per_km_rate,
              per_kg_rate: vehicleType.pricingRule.per_kg_rate,
              minimum_fare: vehicleType.pricingRule.minimum_fare,
              status: vehicleType.pricingRule.status
            }
          : null
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

const mapFareEstimation = (estimation, shipment) =>
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
        updated_at: estimation.updated_at,
        fare_breakdown: {
          base_fare: estimation.base_fare,
          distance_charge: estimation.distance_charge,
          weight_charge: estimation.weight_charge,
          minimum_fare: shipment?.vehicleType?.pricingRule?.minimum_fare || 0,
          computed_amount:
            Number(estimation.base_fare || 0) +
            Number(estimation.distance_charge || 0) +
            Number(estimation.weight_charge || 0),
          final_amount: estimation.final_amount,
          applied_minimum_fare:
            Number(estimation.final_amount || 0) >
            Number(estimation.base_fare || 0) +
              Number(estimation.distance_charge || 0) +
              Number(estimation.weight_charge || 0)
        },
        pricing_rule: shipment?.vehicleType?.pricingRule
          ? {
              id: shipment.vehicleType.pricingRule.id,
              base_fare: shipment.vehicleType.pricingRule.base_fare,
              per_km_rate: shipment.vehicleType.pricingRule.per_km_rate,
              per_kg_rate: shipment.vehicleType.pricingRule.per_kg_rate,
              minimum_fare: shipment.vehicleType.pricingRule.minimum_fare,
              status: shipment.vehicleType.pricingRule.status
            }
          : null,
        vehicle_type: shipment?.vehicleType
          ? {
              id: shipment.vehicleType.id,
              type_name: shipment.vehicleType.type_name
            }
          : null,
        debug: {
          distance_source: shipment?.route_provider || null,
          route_distance_km: shipment?.route_distance_km ?? estimation.distance_km,
          vehicle_type: shipment?.vehicleType?.type_name || null,
          pricing_rule_id: shipment?.vehicleType?.pricingRule?.id || null,
          pricing_rule_status: shipment?.vehicleType?.pricingRule?.status || null,
          base_fare:
            shipment?.vehicleType?.pricingRule?.base_fare ?? estimation.base_fare,
          per_km_rate: shipment?.vehicleType?.pricingRule?.per_km_rate ?? null,
          per_kg_rate: shipment?.vehicleType?.pricingRule?.per_kg_rate ?? null,
          minimum_fare: shipment?.vehicleType?.pricingRule?.minimum_fare ?? 0,
          weight_kg: estimation.weight_kg,
          formula: shipment?.vehicleType?.pricingRule
            ? `max(${Number(shipment.vehicleType.pricingRule.base_fare || 0).toFixed(2)} + (${Number(
                shipment?.route_distance_km ?? estimation.distance_km ?? 0
              ).toFixed(2)} x ${Number(shipment.vehicleType.pricingRule.per_km_rate || 0).toFixed(
                2
              )}) + (${Number(estimation.weight_kg || 0).toFixed(2)} x ${Number(
                shipment.vehicleType.pricingRule.per_kg_rate || 0
              ).toFixed(2)}), ${Number(shipment.vehicleType.pricingRule.minimum_fare || 0).toFixed(
                2
              )})`
            : null,
          final_amount: estimation.final_amount
        }
      }
    : null;

const mapShipmentBase = (shipment) => ({
  id: shipment.id,
  shipment_number: shipment.shipment_number,
  customer_id: shipment.customer_id,
  pickup_address_id: shipment.pickup_address_id,
  pickup_address: shipment.pickup_address,
  pickup_address_snapshot: shipment.pickup_address_snapshot,
  pickup_city: shipment.pickup_city,
  pickup_state: shipment.pickup_state,
  pickup_country: shipment.pickup_country,
  pickup_pincode: shipment.pickup_pincode,
  delivery_address_id: shipment.delivery_address_id,
  delivery_address: shipment.delivery_address,
  delivery_address_snapshot: shipment.delivery_address_snapshot,
  delivery_city: shipment.delivery_city,
  delivery_state: shipment.delivery_state,
  delivery_country: shipment.delivery_country,
  delivery_pincode: shipment.delivery_pincode,
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
  route_distance_km: shipment.route_distance_km,
  route_duration_minutes: shipment.route_duration_minutes,
  estimated_eta: shipment.estimated_eta,
  route_provider: shipment.route_provider,
  route_geometry: shipment.route_geometry,
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
  pickup_location: mapShipmentLocation(shipment, 'pickup'),
  delivery_location: mapShipmentLocation(shipment, 'delivery'),
  route: {
    distance_km: shipment.route_distance_km,
    duration_minutes: shipment.route_duration_minutes,
    estimated_eta: shipment.estimated_eta,
    provider: shipment.route_provider,
    geometry: shipment.route_geometry
  },
  vehicle_type: mapVehicleTypeSummary(shipment.vehicleType)
});

const toShipmentDetailDto = (shipment) => ({
  ...toShipmentListDto(shipment),
  fare_estimation: mapFareEstimation(shipment.fareEstimation, shipment),
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
