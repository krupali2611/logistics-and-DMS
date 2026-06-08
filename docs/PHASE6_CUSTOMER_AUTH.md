# Phase 6 Customer Authentication & Account Management

## Backend coverage

- Added `customer_users`, `customer_refresh_tokens`, and `customer_otps` Sequelize models and migrations.
- Added customer JWT access and refresh token flow with separate `/api/customer-auth/*` endpoints.
- Added OTP registration, resend, verification, and forgot-password flows.
- Added protected customer profile APIs at `/api/customer/profile` and `/api/customer/change-password`.
- Added customer shipment ownership routes at `/api/customer/shipments` using dedicated customer auth middleware.
- Extended shipment attribution so portal-created shipments can be linked to `customer_users` without breaking admin-created shipments.

## Frontend coverage

- Added dedicated customer auth context and axios refresh-token instance.
- Added customer portal pages:
  - `/customer/register`
  - `/customer/login`
  - `/customer/forgot-password`
  - `/customer/reset-password`
  - `/customer/verify-otp`
  - `/customer/profile`

## Environment variables

Add these backend variables if they are not already present:

```env
CUSTOMER_JWT_ACCESS_SECRET=your-customer-access-secret
CUSTOMER_JWT_REFRESH_SECRET=your-customer-refresh-secret
CUSTOMER_JWT_ACCESS_EXPIRES_IN=15m
CUSTOMER_JWT_REFRESH_EXPIRES_IN=7d
CUSTOMER_JWT_REFRESH_TTL_DAYS=7
CUSTOMER_OTP_TTL_MINUTES=10
```

If omitted, the module falls back to the admin JWT secrets and uses `15m` / `7d`.

## Installation steps

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Run the new database migrations:

```bash
cd backend
npm run db:migrate
```

4. Start backend:

```bash
cd backend
npm run dev
```

5. Start frontend:

```bash
cd frontend
npm run dev
```

## Notes for future phases

- Shipment ownership now flows through `req.user.customer_id`, which keeps Phase 7-9 assignment and tracking logic compatible with customer-scoped access.
- Portal shipment creation stores `created_by_customer_user_id`, preparing the model for customer booking analytics and customer-specific booking history.
