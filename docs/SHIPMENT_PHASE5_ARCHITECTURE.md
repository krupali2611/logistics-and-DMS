# Shipment Module Phase 5 Revision

## What changed

- Shipments are now modeled as customer-owned records first, with admin visibility remaining global.
- Shipment records keep immutable pickup and delivery address snapshots so history does not drift when a customer edits saved addresses later.
- Shipment records now store map-ready latitude, longitude, and Google Place ID fields for pickup and delivery.
- Driver and vehicle linkage remains outside the `shipments` table. Future operational ownership flows through `shipment_assignments`.
- Live tracking is prepared through current-location fields on `shipments` and append-only `shipment_tracking_events`.

## Customer ownership foundation

- `customer_id` remains mandatory at the service layer.
- Creation logic now supports future customer-authenticated users by resolving `customer_id` from `req.user.customer_id` when that field becomes available in Phase 6.
- Access checks are shipment-scoped:
  - Admin-style users with no `customer_id` in auth context can access all shipments.
  - Customer-style users with `customer_id` in auth context can only access shipments where `shipments.customer_id` matches.

## New database structures

### `shipments`

Added fields:

- `pickup_address_snapshot`
- `delivery_address_snapshot`
- `pickup_latitude`
- `pickup_longitude`
- `delivery_latitude`
- `delivery_longitude`
- `pickup_place_id`
- `delivery_place_id`
- `current_driver_latitude`
- `current_driver_longitude`
- `current_eta`
- `current_location_updated_at`

### `shipment_assignments`

Purpose:

- Supports Phase 7 assignment engine and Phase 8 auto assignment without redesigning `shipments`.
- Keeps assignment lifecycle, driver linkage, vehicle linkage, assignment origin, acceptance, rejection, and activation separate from the shipment core record.

### `shipment_tracking_events`

Purpose:

- Stores tracking history as append-only location events.
- Supports future driver app updates, dispatch updates, ETA refreshes, and customer-facing tracking timelines.

## API foundation

Prepared endpoints:

- `GET /api/shipments`
- `POST /api/shipments`
- `GET /api/shipments/:id`
- `PUT /api/shipments/:id`
- `GET /api/shipments/my`
- `GET /api/shipments/my/:id`
- `GET /api/shipments/:id/track`

## DTO foundation

Shipment responses now have dedicated DTO mapping for:

- Shipment list rows
- Shipment detail responses
- Tracking responses

This keeps future customer mobile app payloads stable even if Sequelize models evolve internally.

## Phase readiness

- Phase 6 Customer Authentication:
  - Add `customer_id` to authenticated request context for customer users.
  - Shipment services already honor that scope.
- Phase 7 Assignment Engine:
  - Persist assignment decisions into `shipment_assignments`.
- Phase 8 Auto Assignment:
  - Use `assignment_type = AUTO` and `auto_assignment_score`.
- Phase 9 Live Tracking:
  - Update `shipments.current_driver_*` and append `shipment_tracking_events` records.
