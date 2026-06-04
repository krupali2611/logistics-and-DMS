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
