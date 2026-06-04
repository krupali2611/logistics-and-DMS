# Logistics & Delivery Management System

Phase 1 foundation for the Logistics & Delivery Management System, covering only:

- Backend APIs
- Admin Web Application

This phase intentionally does not include the Driver Mobile App or Customer Mobile App.

## Tech Stack

- Backend: Node.js, Express.js, PostgreSQL, Sequelize ORM, JWT, bcrypt, dotenv, express-validator, cors, helmet, morgan
- Frontend: React.js, React Router DOM, Axios, Context API, CSS Modules

## Project Structure

```text
backend/
  config/
    config.js
  migrations/
  seeders/
  src/
    app.js
    server.js
    config/
    controllers/
    middleware/
    models/
    routes/
    seeders/
    services/
    utils/
    validators/

frontend/
  src/
    api/
    components/
    context/
    layouts/
    pages/
    routes/
    styles/
    App.jsx
    main.jsx

docs/
  API_DOCUMENTATION.md
  POSTGRESQL_SCHEMA.sql
```

## Features Delivered In Phase 1

- JWT access token authentication
- Refresh token rotation with database persistence
- RBAC with roles and permissions
- Super Admin and Admin seed data
- Default Super Admin user seeding
- Protected admin routes
- Profile and password management
- Centralized axios auth handling
- Clean admin dashboard layout for future modules
- Sequelize migrations and seeders
- Clean architecture folder separation

## Environment Variables

### Backend `.env`

Copy [backend/.env.example](/d:/krupali/logistics%20and%20DMS/backend/.env.example) to `backend/.env`.

```env
NODE_ENV=development
PORT=5000
APP_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres.xxxxxxxxx:your_supabase_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_ACQUIRE=60000
DB_POOL_IDLE=10000
DB_POOL_EVICT=1000
JWT_ACCESS_SECRET=replace_with_strong_access_secret
JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
JWT_RESET_SECRET=replace_with_strong_reset_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_EXPIRES_IN=15m
DEFAULT_ADMIN_EMAIL=admin@logistics.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

### Frontend `.env`

Copy [frontend/.env.example](/d:/krupali/logistics%20and%20DMS/frontend/.env.example) to `frontend/.env`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation Steps

### 1. Create a Supabase project

Go to `https://supabase.com`, create a new project, and wait for the database to finish provisioning.

### 2. Get the Supabase PostgreSQL connection string

In Supabase:

- Open `Project Settings`
- Open `Database`
- Find `Connection string`
- Choose the `URI` or `Transaction pooler` connection
- Copy the PostgreSQL URL

Use the pooler-style URL for production-ready pooled connections, for example:

```env
DATABASE_URL=postgresql://postgres.xxxxxxxxx:your_supabase_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### 3. Configure backend `.env`

Update [backend/.env](/d:/krupali/logistics%20and%20DMS/backend/.env) with your Supabase `DATABASE_URL` and keep the SSL-enabled pool settings.

### 4. Install backend dependencies

```powershell
cd backend
npm.cmd install
```

### 5. Run backend migrations against Supabase

```powershell
cd backend
npm.cmd run db:migrate
```

### 6. Run backend seeders against Supabase

```powershell
cd backend
npm.cmd run db:seed
```

### 7. Start backend server

```powershell
cd backend
npm.cmd run dev
```

### 8. Install frontend dependencies

```powershell
cd frontend
npm.cmd install
```

### 9. Start frontend app

```powershell
cd frontend
npm.cmd run dev
```

### Default Super Admin

- Email: `admin@logistics.com`
- Password: `Admin@123`

## Authentication Flow Diagram

```mermaid
flowchart TD
  A[Login Request] --> B[Validate Credentials]
  B --> C[Load User Roles and Permissions]
  C --> D[Generate Access Token 15m]
  C --> E[Generate Refresh Token 7d]
  E --> F[Store Refresh Token In Database]
  D --> G[Return Access Token + Refresh Token + User + Roles + Permissions]
  G --> H[Frontend Stores Session]
  H --> I[Axios Sends Access Token]
  I --> J{Access Token Expired?}
  J -- No --> K[Continue Request]
  J -- Yes --> L[Call Refresh Endpoint]
  L --> M[Validate Refresh Token From DB]
  M --> N[Rotate Refresh Token]
  N --> O[Return New Token Set]
  O --> I
```

## RBAC Flow Diagram

```mermaid
flowchart TD
  A[Protected API Request] --> B[authMiddleware]
  B --> C[Verify JWT Signature]
  C --> D[Check User Exists And Is Active]
  D --> E[permissionMiddleware required_permission]
  E --> F[Load User Roles]
  F --> G[Load Role Permissions]
  G --> H{Permission Exists?}
  H -- Yes --> I[Controller Executes]
  H -- No --> J[403 Forbidden]
```

## API Documentation

Full API details are available in [docs/API_DOCUMENTATION.md](/d:/krupali/logistics%20and%20DMS/docs/API_DOCUMENTATION.md).

## PostgreSQL Schema

Full schema SQL is available in [docs/POSTGRESQL_SCHEMA.sql](/d:/krupali/logistics%20and%20DMS/docs/POSTGRESQL_SCHEMA.sql).

## Supabase Database Notes

- The backend uses `DATABASE_URL` only.
- Sequelize runtime and Sequelize CLI both use the same Supabase connection source.
- SSL is enabled for Supabase PostgreSQL connections.
- Connection pooling is enabled for compatibility with the Supabase pooler URL.
- Migrations and seeders run against the same Supabase database configured in `backend/.env`.

## Phase 2 Readiness

The foundation is structured to extend into:

- Driver Management Module
- Vehicle Management Module
- Customer Management Module
- Shipment Management Module
- Assignment Engine
- Tracking
- Payments
- Reports
