# API Documentation

Base URL: `http://localhost:5000/api`

## Response Format

### Success

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email."
    }
  ]
}
```

## Authentication

### POST `/auth/login`

Request:

```json
{
  "email": "admin@logistics.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {},
    "roles": ["Super Admin"],
    "permissions": ["user_view", "dashboard_view"]
  }
}
```

### POST `/auth/refresh`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### POST `/auth/logout`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### POST `/auth/forgot-password`

Request:

```json
{
  "email": "admin@logistics.com"
}
```

Note: in non-production mode the API returns the reset token in the payload for local testing.

### POST `/auth/reset-password`

Request:

```json
{
  "token": "reset-token",
  "password": "NewAdmin@123"
}
```

## Users

Authorization: `Bearer <accessToken>`

### GET `/users/profile`

Returns current user profile, roles, and permissions.

### PUT `/users/profile`

Request:

```json
{
  "first_name": "System",
  "last_name": "Administrator",
  "phone": "+911234567890"
}
```

### PUT `/users/change-password`

Request:

```json
{
  "current_password": "Admin@123",
  "new_password": "Admin@1234"
}
```

## User Management Foundation

These endpoints are already prepared for future admin user management screens.

### GET `/users`

Required permission: `user_view`

### POST `/users`

Required permission: `user_create`

Request:

```json
{
  "first_name": "Operations",
  "last_name": "Manager",
  "email": "ops@logistics.com",
  "phone": "+911111111111",
  "password": "OpsUser@123",
  "role_ids": ["uuid-role-id"]
}
```

### PUT `/users/:id`

Required permission: `user_update`

### DELETE `/users/:id`

Required permission: `user_delete`

## Shipments

Authorization: `Bearer <accessToken>`

### POST `/shipments`

Required permission: `shipment_create`

Notes:
- `pickup_address_snapshot` and `delivery_address_snapshot` are optional override fields. If omitted, the API stores immutable snapshots from the selected customer addresses at booking time.
- `pickup_latitude`, `pickup_longitude`, `delivery_latitude`, and `delivery_longitude` are optional. If omitted, the API snapshots coordinates from the selected customer addresses when available.
- `pickup_place_id` and `delivery_place_id` are optional map-provider place references for Google Maps, OpenStreetMap integrations, and future live tracking flows.

Request:

```json
{
  "customer_id": "uuid",
  "pickup_address_id": "uuid",
  "pickup_address_snapshot": "Warehouse Gate 2, Ring Road, Ahmedabad, Gujarat, India, 380001",
  "pickup_latitude": 23.0225,
  "pickup_longitude": 72.5714,
  "pickup_place_id": "google-or-osm-place-reference",
  "delivery_address_id": "uuid",
  "delivery_address_snapshot": "Dock 4, MIDC Road, Pune, Maharashtra, India, 411018",
  "delivery_latitude": 18.5204,
  "delivery_longitude": 73.8567,
  "delivery_place_id": "google-or-osm-place-reference",
  "vehicle_type_id": "uuid",
  "shipment_type": "PARCEL",
  "priority": "NORMAL",
  "estimated_delivery_date": "2026-06-10",
  "estimated_distance": 550.25,
  "special_instructions": "Handle with care",
  "status": "PENDING_ASSIGNMENT",
  "packages": [
    {
      "package_name": "Electronics carton",
      "package_type": "BOX",
      "weight": 12.5,
      "length": 40,
      "width": 30,
      "height": 20,
      "quantity": 2,
      "declared_value": 15000
    }
  ]
}
```

### PUT `/shipments/:id`

Required permission: `shipment_update`

Notes:
- Existing pickup and delivery snapshots remain unchanged on ordinary shipment updates.
- Snapshots are refreshed only when the corresponding address changes, or when an explicit `pickup_address_snapshot` or `delivery_address_snapshot` is sent in the request.
