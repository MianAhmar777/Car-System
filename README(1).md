# Car Rental Management System

A modular, production-grade **Car Rental Management System** built with **NestJS (Node.js)**, **React.js (SPA)**, **MySQL (Prisma ORM)**, and **Supabase Storage**.

---

## Architecture Overview

```text
                    CAR RENTAL MANAGEMENT SYSTEM
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
            MySQL Database               Supabase Storage
                 │                               │
        Application Metadata             Private File Assets
  (Users, Cars, Bookings, Payments,   (CNIC, Passport, Licenses,
   Contracts, Inspections, Audit)      Contract PDFs, Signatures)
```

---

## Technology Stack

- **Frontend**: React 18, JavaScript, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js, NestJS (TypeScript), Prisma ORM, JWT Authentication, Bcrypt, PDFKit, Supabase Storage SDK.
- **Database**: MySQL (Prisma ORM with versioned migrations).
- **Private Storage**: Supabase Storage (Buckets: `customer-documents`, `contracts`, `signed-contracts`, `vehicle-images`, `inspection-images`).

---

## Production Security & Hardening Checklist

- [x] **Git Security**: `.env` and `uploads/` added to `.gitignore`. Secrets never committed to repository.
- [x] **Service-Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly on NestJS backend; never exposed to React frontend.
- [x] **Private Storage Buckets**: Supabase storage buckets configured as private, requiring backend presigned URLs with 1-hour expiration tokens.
- [x] **Database Migration Strategy**: Production database schema changes managed via versioned Prisma migrations (`npx prisma migrate deploy`).
- [x] **Rate Limiting & Payload Limits**: Express body size limit set to 10MB; CORS restricted to trusted production origin.
- [x] **Health Check Monitoring**: Dedicated `/api/v1/health` endpoint for load balancers and container orchestrators.
- [x] **Automated Testing**: 8 test suites / 20 tests verifying full 16-step rental journey, date overlap locking, document isolation, contract signature immutability, and RBAC security bounds.

---

## Environment Variables Setup

### Development Mode (`/backend/.env`)
```env
PORT=5000
DATABASE_URL="mysql://root:rootpassword@localhost:3306/car_rental_db"
JWT_SECRET="dev-secret-jwt-key-car-rental-2026-local"
JWT_REFRESH_SECRET="dev-secret-jwt-refresh-key-car-rental-2026-local"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

STORAGE_PROVIDER="local"
LOCAL_STORAGE_PATH="./uploads"

CORS_ORIGIN="http://localhost:5173"
```

### Production Deployment Template (`/backend/.env.example`)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="mysql://<PROD_USER>:<PROD_PASS>@<PROD_HOST>:3306/<PROD_DB>"

JWT_SECRET="<GENERATE_RANDOM_64_CHARACTER_SECRET_KEY>"
JWT_REFRESH_SECRET="<GENERATE_DIFFERENT_RANDOM_64_CHARACTER_SECRET_KEY>"

STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<YOUR_ACTUAL_SUPABASE_SERVICE_ROLE_KEY>"

CORS_ORIGIN="https://your-production-app.com"
```

---

## Seed Test Credentials (Local Development Only)

> [!NOTE]
> The following credentials are for **local development and testing only**. Seed script (`prisma/seed.ts`) disables demo user seeding when `NODE_ENV=production`.

- **Admin Account**: `admin@carrental.com` / `AdminPass123!`
- **Staff Account**: `staff@carrental.com` / `AdminPass123!`
- **Customer Account**: `john.doe@example.com` / `CustomerPass123!`

---

## Administrator Portal & Authentication Guide

To maintain security and prevent unauthorized access, administrative registration and login are strictly isolated from customer-facing screens (`/login` and `/register`). Customers cannot see or access admin onboarding controls on public pages.

### Dedicated Administrative URLs

| Action | URL | Description | Access Requirement |
| :--- | :--- | :--- | :--- |
| **Admin Sign In** | `http://localhost:5173/admin/login` | Executive sign-in portal | Registered Administrator credentials |
| **Admin Sign Up** | `http://localhost:5173/admin/register` | Executive administrator onboarding | Master Admin Security Passcode |
| **Admin Dashboard** | `http://localhost:5173/admin` | Fleet management, bookings, approvals | Authenticated `ADMIN` session |

---

### How to Register a New Administrator

1. **Access the Onboarding Portal**:
   - Navigate directly to [`http://localhost:5173/admin/register`](http://localhost:5173/admin/register) (or click **"Register Admin Account"** on the admin login page).
2. **Fill in Required Credentials**:
   - **Full Name**: e.g., `Admin Manager`
   - **Work Email**: e.g., `admin.manager@driveelite.com`
   - **Phone**: Contact phone number
   - **Password**: Secure password (minimum 6 characters)
   - **Master Admin Passcode**: `DriveEliteAdminSecret2026!` *(default key configured via `ADMIN_SECRET_KEY` in `backend/.env`)*.
3. **Submit Registration**:
   - Click **"Register System Administrator"**.
   - The backend validates the Master Passcode and dispatches a 6-digit OTP verification code to the registered email address (also printed in the backend terminal logs).
4. **Verify Account**:
   - Enter the 6-digit OTP code on the verification screen (`/verify-otp`).
   - Upon verification, the user is immediately granted the `ADMIN` role and redirected to the Executive Admin Dashboard at `/admin`.

---

### How to Sign In as an Administrator

1. **Access the Login Portal**:
   - Navigate directly to [`http://localhost:5173/admin/login`](http://localhost:5173/admin/login).
2. **Enter Administrator Credentials**:
   - **Email**: Your registered admin email (or seed admin `admin@carrental.com`)
   - **Password**: Your admin password (or seed password `AdminPass123!`)
3. **Click "Sign In to Admin Portal"**:
   - The system verifies the user's role.
   - **Role Protection**: If an account with the `CUSTOMER` role attempts to log in here, access is automatically denied with an *Insufficient Privileges* alert and a prompt to switch to customer sign in.
   - Upon successful verification, you are routed directly to the Admin Dashboard (`/admin`).

---

### Security & Access Control Hardening

- **URL Obfuscation & Public Separation**: Public customer pages (`/login`, `/register`, navigation header, footer) contain zero links, toggles, or checkboxes for admin account creation.
- **Backend Passcode Enforcement**: The endpoint `POST /api/v1/auth/register-admin` strictly validates `adminSecretKey`. Any request lacking the valid secret passcode is rejected with `401 Unauthorized`.
- **Client Route Guards**: The React frontend uses `<ProtectedRoute allowedRoles={['ADMIN']}>` to prevent non-admin users from accessing `/admin`. Any unauthorized user is redirected to the home page `/`.

---

## Demo Quick Login API Endpoints

Dedicated REST API endpoints are provided for rapid role-based authentication without filling out frontend login UI forms.

| Role | API Endpoint | Default Email |
| :--- | :--- | :--- |
| **Admin** | `POST /api/v1/auth/demo/admin` | `admin@carrental.com` |
| **Staff** | `POST /api/v1/auth/demo/staff` | `staff@carrental.com` |
| **Customer** | `POST /api/v1/auth/demo/customer` | `john.doe@example.com` |

### How to Use

#### 1. Via cURL (Command Line)
```bash
# Admin Demo Login
curl -X POST http://localhost:5000/api/v1/auth/demo/admin

# Staff Demo Login
curl -X POST http://localhost:5000/api/v1/auth/demo/staff

# Customer Demo Login
curl -X POST http://localhost:5000/api/v1/auth/demo/customer
```

#### 2. Sample API Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "message": "Demo login successful as ADMIN",
    "user": {
      "id": "bd4963e4-aeee-4c07-bc72-d4d20783f45f",
      "email": "admin@carrental.com",
      "fullName": "System Administrator",
      "role": "ADMIN",
      "permissions": ["MANAGE_FLEET", "VERIFY_DOCUMENTS", "REVIEW_CONTRACTS"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Operation successful"
}
```

#### 3. Via JavaScript / Fetch API
```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/demo/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});
const result = await response.json();
console.log('Access Token:', result.data.accessToken);
```

---

## Development & Production Deployment Commands

### Development Commands (`/backend`)
```bash
# Install dependencies
npm install

# Generate Prisma Client & Run Versioned Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed database with development fleet & roles
npm run prisma:seed

# Run Jest unit, integration, and full E2E test suites
npm test

# Start development server
npm run start:dev
npm run dev
```

### Production Deployment Commands (`/backend`)
```bash
# Install production dependencies
npm ci --only=production

# Deploy versioned Prisma migrations to production database
npx prisma migrate deploy
npx prisma generate

# Build TypeScript to production dist
npm run build

# Start production server
npm run start:prod
```

### Frontend (`/frontend`)
```bash
# Install dependencies & build Vite production assets
npm install
npm run build
npm run dev
```
