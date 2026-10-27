# MANDATORY TECHNOLOGY STACK

The project MUST use the following technologies.

## Frontend

* React.js
* JavaScript
* React Router
* Axios
* Modern React functional components
* Hooks
* Reusable components
* Responsive CSS / Tailwind CSS where appropriate

The frontend MUST be a Single Page Application.

Do NOT use:

* Next.js
* Angular
* Vue
* Laravel Blade
* Server-rendered frontend pages

---

# Backend

The backend MUST use:

* Node.js
* NestJS
* JavaScript

NestJS must be used as the backend framework.

Use NestJS modules to organize the application by feature.

Recommended backend modules include:

```text
auth
users
roles
permissions
cars
categories
locations
bookings
pricing
payments
invoices
services
discounts
documents
contracts
signatures
inspections
maintenance
vehicle-release
reviews
notifications
reports
audit
storage
settings
```

Use:

* REST APIs
* NestJS Controllers
* NestJS Services
* NestJS Guards
* NestJS Middleware
* NestJS Interceptors where appropriate
* DTO/input validation
* Centralized exception handling
* Dependency injection
* Modular architecture

Business logic MUST NOT be placed directly inside controllers.

Controllers should remain thin.

Business rules must be implemented inside services/modules.

---

# Database

The primary database MUST be:

* MySQL / supabase

Use a proper relational database design.

The database must contain:

* Primary keys
* Foreign keys
* Unique constraints
* Indexes
* Transactions
* Proper relationships
* Timestamps
* Soft deletion where appropriate

Do NOT use:

* PostgreSQL
* MongoDB
* Firebase Firestore

---

# Supabase

Supabase MUST be used where it provides a clear benefit, particularly for:

* File/object storage
* Customer documents
* Driving license uploads
* CNIC/passport uploads
* Rental contracts
* Signed contracts
* Contract PDFs
* Vehicle images
* Inspection photographs

Use **Supabase Storage** for private document/file storage.

Sensitive files MUST NOT be publicly accessible.

Use private buckets and secure access mechanisms.

Examples:

```text
customer-documents
contracts
signed-contracts
vehicle-images
inspection-images
```

The application database remains **MySQL**.

Do NOT use Supabase PostgreSQL as the primary application database.

Do NOT create two competing application databases.

---

# Database vs Supabase Responsibility

Use this separation:

```text
                    CAR RENTAL SYSTEM
                           │
             ┌─────────────┴─────────────┐
             │                           │
          MySQL                     Supabase
             │                           │
      Application Data              File Storage
             │                           │
      ┌──────┴──────┐             ┌──────┴────────┐
      │             │             │               │
   Users         Cars          Documents       Contracts
   Bookings      Payments      License         Signed PDFs
   Contracts     Invoices      CNIC            Images
   Payments      Reviews       Passport        Inspection Photos
   Roles         Locations     Other Files     Other Files
```

MySQL stores the **metadata and business records**.

Supabase Storage stores the **actual files**.

For example:

```text
MySQL

customer_documents
------------------
id
user_id
document_type
file_path
file_name
file_size
mime_type
verification_status
uploaded_at
verified_at
```

The actual document file is stored in Supabase Storage.

---

# Authentication

Authentication should be implemented through the NestJS backend.

Use:

* JWT access tokens
* Refresh tokens
* Password hashing
* OTP verification
* Protected routes
* Role-based access control
* Permission-based authorization
* Rate limiting

Do NOT rely exclusively on frontend authentication checks.

Every protected API endpoint must verify authentication and authorization on the backend.

---

# File Upload Architecture

The recommended flow is:

```text
React.js
   ↓
NestJS API
   ↓
Validate user permission
   ↓
Validate file
   ↓
Upload to Supabase Storage
   ↓
Save file metadata/path in MySQL
   ↓
Return secure file reference
   ↓
React displays/downloads file
```

Never expose Supabase service-role credentials to React.

Supabase secret/service credentials MUST remain on the backend.

---

# Contract Storage

Rental contracts must use:

```text
React.js
     ↓
NestJS
     ↓
Generate Contract
     ↓
Create PDF
     ↓
Upload PDF to Supabase Storage
     ↓
Save Contract Metadata in MySQL
```

For signed contracts:

```text
Customer
     ↓
Download Contract
     ↓
Sign Offline
     ↓
Upload Signed Contract
     ↓
React
     ↓
NestJS
     ↓
Validate File
     ↓
Upload to Supabase Storage
     ↓
Save Signed Contract Record in MySQL
     ↓
Notify Admin
```

For online signing:

```text
Customer
     ↓
Open Contract
     ↓
Review Contract
     ↓
Sign Inside React
     ↓
NestJS Records Signature
     ↓
Generate Signed Contract
     ↓
Upload Signed Version
     ↓
Save Signature Evidence
     ↓
Notify Admin
```

---

# Final Technology Requirement

The AI MUST NOT replace the selected stack with another technology.

The required stack is:

```text
Frontend
React.js
JavaScript

Backend
Node.js
NestJS
JavaScript

Database
MySQL

Storage
Supabase Storage
```

Car Rental Management System
0. MASTER DIRECTIVE

You are a senior software architect, backend engineer, frontend engineer, database architect, security engineer, QA engineer, and DevOps engineer.

Build a production-ready, real-world Car Rental Management System.

This is NOT a demo, prototype, mockup, CRUD-only project, or collection of disconnected pages.

The system must be designed as a maintainable, secure, scalable modular monolith with proper business logic, database integrity, authentication, authorization, booking management, payments, rental contracts, digital signatures, vehicle release authorization, inspections, notifications, reporting, and auditability.

The application must prioritize:

Business correctness
Data integrity
Security
Reliability
Maintainability
Performance
Accessibility
Responsive UX
Clean architecture
Testability

Never sacrifice business correctness merely to make the UI look impressive.

CORE DEVELOPMENT PRINCIPLES

Every feature must follow:

Production-ready implementation
Clean Architecture
SOLID principles
DRY
Separation of concerns
Feature-based architecture
Reusable components
Strong typing
Secure defaults
Backend-enforced business rules
Database-level integrity
Proper error handling
Proper logging
Auditability

Never create:

Placeholder pages
Dummy buttons
Fake API responses
Fake successful payments
Hardcoded booking availability
Fake contract signatures
Fake user permissions
TODO implementations
Unused features presented as completed
Mock data after the corresponding backend feature exists

If a feature cannot be fully implemented, stop and report the missing dependency instead of pretending it works.

3. SYSTEM OBJECTIVE

Build a complete Car Rental Management System where customers can:

Register
Verify account using OTP
Login/logout
Browse vehicles
Search vehicles
Filter vehicles
View vehicle details
Check availability
Select pickup location
Select return location
Select rental dates/times
Calculate rental price
Select additional services
Apply eligible discounts
Create reservations
Make payments
View bookings
Cancel eligible bookings
View invoices
Provide required rental documents
Review generated rental contracts
Download contracts
Upload signed contracts
Sign contracts electronically inside the application
View signed contracts
Receive notifications
Complete vehicle pickup
View rental history
Leave reviews after completed rentals
Manage profile and settings

Administrators and staff must be able to manage the entire rental operation.

4. USER ROLES

Implement:

CUSTOMER

Customer can:

Register
Verify email/phone
Login
Logout
Manage profile
Upload required documents
Browse vehicles
Search vehicles
Filter vehicles
Check availability
Create bookings
Make payments
View bookings
Cancel eligible bookings
View invoices
View rental contract
Download rental contract
Upload signed contract
Electronically sign contract
View signed contract
Receive notifications
View rental history
Submit reviews after completed rentals

Customer MUST NOT be able to:

Change vehicle availability
Approve own booking
Approve own contract
Mark own contract as verified
Authorize own vehicle release
Modify payment records
Modify admin/staff permissions
Change booking prices
Change system settings
5. STAFF

Staff can:

Login
View bookings
Create bookings on behalf of customers
Confirm bookings
Review customer documents
Review contracts
Verify uploaded signed contracts
Process vehicle pickup
Process vehicle return
Record additional charges
Update vehicle operational status
Perform vehicle inspections
Upload inspection photographs
Manage maintenance
View customers
View rental contracts
View payment status
View operational reports

Staff permissions must be configurable.

6. ADMIN

Admin has full system access.

Admin can manage:

Users
Customers
Staff
Roles
Permissions
Vehicles
Vehicle categories
Vehicle features
Locations
Bookings
Pricing
Additional services
Discounts
Payments
Invoices
Rental contracts
Contract templates
Contract versions
Digital signatures
Signed documents
Vehicle release authorization
Pickup
Returns
Inspections
Maintenance
Reviews
Notifications
Reports
Audit logs
System settings
Security settings

Backend RBAC MUST enforce permissions.

Never rely only on frontend authorization.

7. AUTHENTICATION

Implement:

Registration
Login
Logout
OTP verification
Forgot password
Reset password
Refresh token
JWT authentication
Refresh token rotation
Protected routes
RBAC
Account verification
Rate limiting
Registration Flow
Register
    ↓
Validate
    ↓
Create temporary registration
    ↓
Send OTP
    ↓
Verify OTP
    ↓
Create account
    ↓
Auto Login OR Redirect to Login
    ↓
Dashboard

OTP must have:

Expiry
Resend timer
Maximum attempts
Rate limiting
Secure storage
Verification tracking
Login Flow
Login
    ↓
Validate
    ↓
Authenticate
    ↓
Generate access token
    ↓
Generate refresh token
    ↓
Navigate Dashboard

Never expose sensitive authentication information.

8. CUSTOMER RENTAL REQUIREMENTS

Before a booking can progress to vehicle release, the system must verify all required rental requirements.

Requirements may include:

Full legal name
Email
Phone
Address
CNIC/passport
Driving license number
Driving license expiry
Identity document
Driving license document
Emergency contact where required
Required payment
Security deposit
Required contract acceptance/signature

Requirements must be configurable.

Do not hardcode all requirements into frontend components.

9. VEHICLE MANAGEMENT

Each vehicle must contain:

ID
Registration number
Make
Model
Year
Color
Category
Transmission
Fuel type
Seating capacity
Number of doors
Mileage
Daily rental price
Weekly rental price
Monthly rental price
Security deposit
Description
Features
Images
Location
Current status
Created date
Updated date

Vehicle statuses:

AVAILABLE
RESERVED
RENTED
MAINTENANCE
INACTIVE

Additional operational states may be introduced if required.

Customers cannot manually modify vehicle status.

10. VEHICLE CATEGORIES

Categories must be database-driven.

Examples:

Economy
Compact
Sedan
SUV
Luxury
Van
Pickup

Admin can:

Create
Update
Delete
Restore
Activate/deactivate
Sort
Search
11. LOCATIONS

Support multiple rental locations.

Location fields:

ID
Name
Address
City
Contact number
Opening hours
Active/inactive status

Support:

Pickup location
Return location
One-way rentals where applicable
12. AVAILABILITY ENGINE

Availability is a critical business rule.

A vehicle MUST NOT be bookable when:

Another active/confirmed booking overlaps
Vehicle is under maintenance
Vehicle is inactive
Vehicle is already rented
Vehicle is otherwise unavailable

Backend must perform date/time overlap validation.

Example:

Existing:
September 10 → September 15

Requested:
September 13 → September 18

Result:
REJECT

Availability must consider:

Booking dates
Booking times
Vehicle status
Maintenance periods
Pickup location
Return location

Use database transactions and appropriate locking/constraints to prevent race conditions.

Never rely on frontend availability checks.

13. BOOKING SYSTEM

Booking fields:

Booking ID
Booking reference
Customer
Vehicle
Pickup location
Return location
Pickup date/time
Return date/time
Rental duration
Base price
Additional services
Additional charges
Discount
Tax
Security deposit
Total amount
Payment status
Booking status
Cancellation reason
Created date
Updated date

Booking statuses:

PENDING
CONFIRMED
CANCELLED
PICKED_UP
ACTIVE
RETURNED
COMPLETED
NO_SHOW

Prevent invalid state transitions.

Example:

CANCELLED → PICKED_UP

must never be allowed.

14. PRICE CALCULATION

Never trust prices received from React.

Backend must calculate:

Rental Duration
× Applicable Rate
= Base Rental

+ Additional Services
+ Taxes
+ Applicable Fees
- Discounts
= Total

Security Deposit
= Separate Amount

Store a price snapshot in the booking.

Historical bookings must NOT change when vehicle pricing changes later.

15. ADDITIONAL SERVICES

Support services such as:

GPS
Child seat
Additional driver
Insurance
Delivery/pickup
Extra mileage
Other configurable services

Pricing methods:

PER_DAY
PER_BOOKING
FIXED

Admin can manage services.

16. CUSTOMER DOCUMENT MANAGEMENT

Create a secure document-management system.

Documents may include:

CNIC
Passport
Driving license
Proof of address
Other required rental documents

Requirements:

Secure storage
Access control
File type validation
File size validation
Malware/security validation where possible
Private URLs
Expiry tracking
Verification status
Audit history

Never expose sensitive documents publicly.

17. PAYMENT SYSTEM

Create a payment abstraction layer.

Payment statuses:

PENDING
PROCESSING
SUCCESS
FAILED
REFUNDED
PARTIALLY_REFUNDED

Payment records:

Payment ID
Booking ID
Customer
Amount
Currency
Provider
Provider transaction ID
Status
Payment date

Never trust payment success from the frontend.

Use server-side verification/webhooks where supported.

18. INVOICE SYSTEM

Generate invoices containing:

Invoice number
Customer
Booking reference
Vehicle
Rental period
Base rental
Services
Discounts
Taxes
Additional charges
Security deposit
Amount paid
Amount due
Refunds
Payment status

Invoices must be viewable and downloadable.

19. RENTAL CONTRACT SYSTEM

This is a CORE module.

The rental contract must NOT be a simple static PDF.

It must be generated dynamically from:

Customer information
Vehicle information
Booking information
Rental dates
Pickup/return locations
Pricing
Security deposit
Additional services
Rental policies
Cancellation policy
Mileage rules
Fuel policy
Damage policy
Late return policy
Customer responsibilities
Company responsibilities
Terms and conditions
Applicable configurable clauses

Contract templates must be database-driven.

Admin must be able to manage contract templates.

20. CONTRACT GENERATION FLOW

The system should follow:

Booking Created
      ↓
Booking Requirements Checked
      ↓
Payment/Deposit Requirements Checked
      ↓
Customer Documents Verified
      ↓
Booking Eligible For Contract
      ↓
Generate Contract
      ↓
Create Contract Version
      ↓
Show Contract To Customer
      ↓
Show Contract To Admin/Staff

The system must NOT generate a contract using incomplete or invalid booking data.

21. CONTRACT STATUS

Implement contract states:

DRAFT
GENERATED
AVAILABLE_FOR_REVIEW
CUSTOMER_VIEWED
PENDING_SIGNATURE
SIGNED_BY_CUSTOMER
UPLOADED_BY_CUSTOMER
UNDER_ADMIN_REVIEW
VERIFIED
REJECTED
EXPIRED
CANCELLED

The exact state machine must be enforced by backend business logic.

22. CONTRACT VERSIONING

Every generated contract must have a version.

Store:

Contract ID
Contract number
Booking ID
Template ID
Template version
Contract version
Generated timestamp
Customer
Vehicle
Contract status
File reference
Hash/checksum
Signed timestamp
Signature method
Verification timestamp
Verified by
Rejection reason
Created date
Updated date

If contract terms change after signing:

DO NOT silently overwrite the existing signed contract.

Create a new version.

Signed contracts must remain immutable.

23. CUSTOMER CONTRACT VIEW

Customer must be able to open the contract inside the application.

Provide:

Contract viewer
Page navigation
Zoom
Download
Print
Signature action
Contract version
Status
Signing date
Signing method

The customer must clearly see:

Contract Status
Booking Reference
Vehicle
Rental Dates
Total Amount
Security Deposit
Terms
Signature Status
24. ADMIN CONTRACT VIEW

Admin/staff must be able to:

View contracts
Search contracts
Filter contracts
Open contract
Download contract
View contract version
View customer signature status
View uploaded signed contract
Review signature evidence
Approve contract
Reject contract
Request re-signing
View audit history

Admin must never modify a customer's signed document directly.

25. CONTRACT DOWNLOAD

Customer must be able to download the generated contract.

The downloaded contract must contain:

Contract number
Booking information
Customer information
Vehicle information
Rental details
Financial details
Terms and conditions
Signature section
Date
Contract version

The downloaded document must be generated from the actual database contract version.

Never generate a fake/static contract.

26. SIGNED CONTRACT UPLOAD

After downloading the contract, the customer must have:

Upload Signed Contract

option.

Flow:

Generated Contract
      ↓
Download
      ↓
Customer Signs Offline
      ↓
Upload Signed Contract
      ↓
Validate File
      ↓
Store Securely
      ↓
Status = UPLOADED_BY_CUSTOMER
      ↓
Notify Admin
      ↓
Admin Reviews
      ↓
Approve / Reject

Uploaded contract requirements:

PDF preferred
File size limit
MIME type validation
Secure storage
Private access
Malware/security validation where available
File checksum
Upload timestamp
Uploaded by user
Audit log

Customer cannot replace a submitted signed contract without creating a new submission/version.

27. IN-APP ELECTRONIC SIGNATURE

The customer should NOT be forced to download, print, sign, scan, and upload.

Provide an optional:

Sign Contract Online

feature.

Flow:

Open Contract
      ↓
Review Terms
      ↓
Click "Sign Contract"
      ↓
Display Signature Area
      ↓
Customer Draws Signature OR Uses Typed Signature
      ↓
Customer Confirms
      ↓
Record Signature Evidence
      ↓
Generate Signed Contract
      ↓
Lock Contract Version
      ↓
Status = SIGNED_BY_CUSTOMER
      ↓
Notify Admin

The UI must clearly state that the user is signing the displayed contract version.

28. DIGITAL SIGNATURE EVIDENCE

For every electronic signature store:

Contract ID
Contract version
User ID
Signature image/data
Signature method
Signed timestamp
IP address where legally appropriate
User agent where appropriate
Authentication/session reference
Document checksum/hash
Signature timestamp
Consent/confirmation record
Audit log

Do not claim that the signature is legally enforceable in every jurisdiction.

The system should provide configurable legal/consent wording appropriate to the business jurisdiction.

The signed document must become immutable after signing.

29. CONTRACT SIGNATURE METHODS

Support:

E_SIGNATURE
UPLOADED_SIGNED_DOCUMENT

Track the method.

Example:

signatureMethod:
E_SIGNATURE

or:

signatureMethod:
UPLOADED_DOCUMENT
30. CONTRACT ADMIN APPROVAL

After customer signs:

Customer Signs
      ↓
System Records Signature
      ↓
Admin Notification
      ↓
Admin Opens Contract
      ↓
Admin Reviews
      ↓
Approve OR Reject

If rejected:

Admin must provide:

Rejection reason

Customer receives notification.

Customer may then be required to:

Correct the document
Re-sign
Upload a new version

Never silently replace an existing signed document.

31. ADMIN NOTIFICATION

When customer completes signing/uploading:

Admin must receive a notification such as:

Customer has completed the rental contract for Booking #ABC123.

The contract is ready for review.

Customer: John Doe
Vehicle: Toyota Corolla
Booking: #ABC123
Contract: RC-2026-00123
Status: Signed

Notification channels should support the architecture for:

In-app notifications
Email
Future SMS/push integration
32. VEHICLE RELEASE AUTHORIZATION

This is a critical business rule.

A vehicle MUST NOT be released to a customer merely because the booking is confirmed.

Before vehicle pickup/release, verify configurable prerequisites.

Example:

Booking Confirmed
      ↓
Payment Requirements Satisfied
      ↓
Customer Documents Verified
      ↓
Contract Generated
      ↓
Contract Signed
      ↓
Contract Approved
      ↓
Vehicle Release Authorized
      ↓
Staff Processes Pickup
      ↓
Vehicle Released

The system must provide a clear:

VEHICLE RELEASE AUTHORIZED

state.

33. VEHICLE RELEASE CHECKLIST

Before releasing a vehicle, staff must see a checklist:

[✓] Booking confirmed
[✓] Customer identity verified
[✓] Driving license verified
[✓] Required documents verified
[✓] Payment verified
[✓] Security deposit verified
[✓] Contract signed
[✓] Contract approved
[✓] Vehicle available
[✓] Vehicle inspection completed

If a required condition is incomplete:

RELEASE BLOCKED

The system must explain exactly why.

Example:

Vehicle cannot be released.

Reason:
Customer contract has not been signed.
34. VEHICLE RELEASE AUTHORIZATION

Only authorized staff/admin can authorize vehicle release.

Customer cannot authorize their own release.

When authorized:

Store:

Authorization ID
Booking ID
Vehicle ID
Authorized by
Authorization timestamp
Checklist result
Notes
Audit record

After authorization, staff can proceed with pickup.

35. PICKUP INSPECTION

Before vehicle handover, staff must record:

Customer identity
Driving license verification
Vehicle condition
Mileage
Fuel level
Existing damage
Photos
Notes
Staff member
Date/time

Create immutable inspection evidence where appropriate.

Then:

CONFIRMED
    ↓
RELEASE_AUTHORIZED
    ↓
PICKED_UP
    ↓
ACTIVE
36. VEHICLE RETURN

When returned:

Record:

Return mileage
Return fuel level
New damage
Existing damage comparison
Late return
Additional mileage
Additional charges
Photos
Notes
Staff member
Date/time

Calculate additional charges on backend.

Then:

ACTIVE
    ↓
RETURNED
    ↓
COMPLETED
37. CONTRACT ↔ BOOKING INTEGRITY

A contract MUST always belong to exactly one booking.

A contract must contain a snapshot of the relevant booking information.

If booking information changes before signing:

Detect contract invalidation
Do not allow signing of stale contract
Generate a new contract version

If the contract is already signed:

Do not modify the signed contract
Create a new version if a legally/business-required amendment is needed
Preserve the original signed version
38. CONTRACT AUDIT LOG

Record events such as:

CONTRACT_GENERATED
CONTRACT_VIEWED
CONTRACT_DOWNLOADED
SIGNATURE_STARTED
CONTRACT_SIGNED
SIGNED_DOCUMENT_UPLOADED
CONTRACT_SUBMITTED_FOR_REVIEW
CONTRACT_APPROVED
CONTRACT_REJECTED
CONTRACT_VERSION_CREATED
CONTRACT_EXPIRED
VEHICLE_RELEASE_AUTHORIZED

Each event should contain:

User
Role
Action
Timestamp
Entity
Entity ID
Relevant metadata
IP/device information where appropriate
39. MAINTENANCE

Track:

Maintenance type
Description
Start date
End date
Cost
Mileage
Notes
Status

Vehicles under maintenance cannot be booked.

40. REVIEWS

Customers may review vehicles only after:

Booking = COMPLETED

Prevent:

Duplicate reviews for same rental
Reviews from users who did not rent
Reviews for cancelled bookings
Reviews before rental completion

Rating:

1–5
41. SEARCH AND FILTERING

Backend filtering must support:

Location
Pickup date
Return date
Category
Price range
Transmission
Fuel type
Seating capacity
Features
Availability

Support:

Pagination
Sorting
Search
Filtering

Never load the entire vehicle database into React simply to filter it client-side.

42. CUSTOMER DASHBOARD

Display:

Upcoming bookings
Active rental
Previous bookings
Payment status
Pending requirements
Contract status
Signature status
Vehicle release status
Recent invoices
Notifications

Example:

Booking #ABC123

Payment: PAID
Documents: VERIFIED
Contract: SIGNED
Contract Approval: APPROVED
Vehicle Release: AUTHORIZED

Pickup:
10:00 AM
25 September 2026
43. STAFF DASHBOARD

Display:

Today's pickups
Today's returns
Active rentals
Available vehicles
Maintenance vehicles
Pending bookings
Pending contract reviews
Signed contracts awaiting approval
Vehicle release blocked bookings
44. ADMIN DASHBOARD

Display:

Total vehicles
Available vehicles
Reserved vehicles
Active rentals
Today's bookings
Revenue
Pending payments
Cancelled bookings
Maintenance vehicles
Customer count
Pending contracts
Signed contracts
Rejected contracts
Vehicle release blocks

Provide meaningful charts and reports.
45. DATABASE DESIGN

Use MySQL / supabase

Minimum entities:

User
Role
Permission
RolePermission

Car
CarCategory
CarImage
CarFeature

Location

Booking
BookingService
AdditionalService

Payment
Invoice

Review

Maintenance
VehicleInspection

CustomerDocument

ContractTemplate
ContractTemplateVersion
RentalContract
RentalContractVersion
ContractSignature
ContractDocument
ContractReview
ContractAuditEvent

VehicleReleaseAuthorization
VehicleReleaseChecklist

CancellationPolicy
Discount

Notification
NotificationTemplate

AuditLog
SystemSetting

Use appropriate relationships.
46. IMPORTANT DATABASE CONSTRAINTS

Unique constraints should include:

User.email
Vehicle.registrationNumber
Booking.bookingReference
Contract.contractNumber
Invoice.invoiceNumber

Use indexes for:

Booking.customerId
Booking.vehicleId
Booking.pickupDate
Booking.returnDate
Booking.status

Contract.bookingId
Contract.status

Payment.bookingId
Payment.status

CustomerDocument.customerId
Notification.userId

Use database transactions for:

Booking creation
Availability confirmation
Payment confirmation
Contract generation
Contract signing
Vehicle release authorization
Pickup
Return
47. API VERSIONING

Use:

/api/v1/

Example:

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

GET /api/v1/cars
GET /api/v1/cars/:id
GET /api/v1/cars/availability

GET /api/v1/bookings
GET /api/v1/bookings/:id
POST /api/v1/bookings
POST /api/v1/bookings/:id/confirm
POST /api/v1/bookings/:id/cancel
POST /api/v1/bookings/:id/pickup
POST /api/v1/bookings/:id/return

GET /api/v1/contracts
GET /api/v1/contracts/:id
GET /api/v1/contracts/:id/download
POST /api/v1/contracts/:id/sign
POST /api/v1/contracts/:id/upload-signed
POST /api/v1/contracts/:id/approve
POST /api/v1/contracts/:id/reject

GET /api/v1/payments
POST /api/v1/payments
POST /api/v1/payments/webhook

GET /api/v1/invoices
GET /api/v1/invoices/:id/download

GET /api/v1/notifications

GET /api/v1/admin/dashboard
GET /api/v1/admin/reports

Use consistent HTTP status codes.

48. API RESPONSE FORMAT

Success:

{
  "success": true,
  "data": {},
  "message": "Booking created successfully"
}

Error:

{
  "success": false,
  "message": "Vehicle is not available for the selected dates",
  "errors": {}
}

Handle:

400
401
403
404
409
422
429
500

appropriately.

Never expose internal stack traces in production.

49. SECURITY

Implement:

Password hashing using bcrypt or Argon2
JWT
Refresh token rotation
RBAC
DTO validation
Input sanitization
Rate limiting
CORS
Helmet/security headers
Secure cookies where applicable
CSRF protection where cookie-based authentication requires it
SQL injection protection through Prisma
Authentication guards
Authorization guards
Audit logging
Secure file uploads
Private document storage

Never expose:

Password hashes
Refresh tokens
Internal errors
Private documents
Sensitive customer information

Never trust:

Frontend role
Frontend price
Frontend availability
Frontend payment result
Frontend contract status
Frontend vehicle-release status
50. FILE STORAGE

Customer documents, contracts, signatures, inspection photographs, and other private files must NOT be stored as publicly accessible files.

Use a storage abstraction supporting:

Local development storage
Production object storage

Examples may include S3-compatible storage.

Generate secure temporary access URLs where required.

Never expose permanent public URLs for sensitive documents.

51. NOTIFICATION SYSTEM

Create a reusable notification system.

Notification types:

BOOKING_CREATED
BOOKING_CONFIRMED
PAYMENT_SUCCESS
PAYMENT_FAILED

CONTRACT_GENERATED
CONTRACT_READY_FOR_SIGNATURE
CONTRACT_SIGNED
SIGNED_CONTRACT_UPLOADED
CONTRACT_APPROVED
CONTRACT_REJECTED

VEHICLE_RELEASE_AUTHORIZED
VEHICLE_RELEASE_BLOCKED

PICKUP_REMINDER
RETURN_REMINDER

BOOKING_CANCELLED
PAYMENT_REFUNDED

Notifications must be stored in the database.

Customer/admin/staff should see unread counts.

52. FRONTEND STRUCTURE
Public
Home
Cars
Car Details
Search Results
Login
Register
Forgot Password
Reset Password
About
Contact
Customer
Dashboard
My Bookings
Booking Details
Checkout
Payments
Invoices
Contracts
Contract Details
Sign Contract
Upload Signed Contract
Profile
Documents
Notifications
Reviews
Settings
Staff
Dashboard
Bookings
Booking Details
Pickup
Returns
Vehicles
Maintenance
Customers
Contracts
Contract Review
Vehicle Release
Inspections
Notifications
Admin
Dashboard
Vehicles
Categories
Bookings
Customers
Staff
Roles
Permissions
Payments
Invoices
Locations
Services
Discounts
Maintenance
Contracts
Contract Templates
Contract Versions
Contract Reviews
Vehicle Releases
Reports
Notifications
Audit Logs
Settings
Security
System Health
53. UI/UX DESIGN SYSTEM

Use one consistent design system.

Define:

Color palette
Typography
Spacing
Border radius
Shadows
Buttons
Inputs
Modals
Tables
Cards
Badges
Alerts
Toasts

Support:

Light mode
Dark mode
Responsive design
Accessibility
Keyboard navigation
Focus states
Screen-reader-friendly labels

Every page must include appropriate:

Loading state
Skeleton
Empty state
Error state
Success state
54. RESPONSIVE DESIGN

Mobile-first.

Must work on:

Mobile
Tablet
Laptop
Desktop

Requirements:

No horizontal page scrolling
Responsive tables
Responsive forms
Responsive cards
Sticky navigation where appropriate
Collapsible sidebar
Mobile-friendly contract viewer
Mobile-friendly signature area
Mobile-friendly document upload
55. CONTRACT SIGNATURE UI

The signature screen must be extremely clear.

Display:

Rental Agreement

Booking: #ABC123
Vehicle: Toyota Corolla
Rental Period: 25 Sep → 28 Sep

[ View Full Contract ]

I have read and agree to the contract terms.

[ Signature Area ]

[ Clear ]
[ Confirm & Sign ]

Before signing, require explicit confirmation.

Do not accidentally sign contracts through a normal button click without clear confirmation.

56. CRUD STANDARDS

Every administrative CRUD must support where applicable:

Create
Read
Update
Delete
Soft Delete
Restore
Bulk Actions
Search
Filters
Pagination
Sorting
Export CSV
Export Excel
Validation
Confirmation modal
Success toast
Error handling
Loading state
57. PERFORMANCE

Implement where appropriate:

Lazy loading
Code splitting
Memoization
Query caching
Pagination
Debouncing
Throttling
Compression
Optimized images
Efficient database queries
Database indexes
Streaming for large files
Background jobs for expensive operations

Do not optimize blindly.

Measure bottlenecks first.

58. TESTING

Write automated tests for critical business logic.

Availability

Test:

No overlap
Partial overlap
Complete overlap
Same-day pickup/return
Multiple bookings
Maintenance conflict
Concurrent booking attempts
Pricing

Test:

1 day
Multiple days
Weekly pricing
Monthly pricing
Discount
Tax
Additional services
Late return
Additional mileage
Security deposit
Authorization

Test:

Customer cannot access another customer's booking
Customer cannot access another customer's contract
Customer cannot approve own contract
Staff cannot perform admin-only actions
Admin has appropriate access
Contract

Test:

Contract generated
Contract version created
Contract viewed
Contract downloaded
Contract signed
Signed contract uploaded
Contract rejected
Contract approved
Contract version changed
Signed contract remains immutable
Vehicle Release

Test:

Missing payment → blocked
Missing documents → blocked
Unsigned contract → blocked
Rejected contract → blocked
Unavailable vehicle → blocked
All requirements complete → authorized
State Machine

Prevent invalid transitions.

59. SEED DATA

Create realistic seed data:

1 admin
2 staff
5 customers
10+ vehicles
Multiple categories
Multiple locations
Services
Discounts
Sample bookings
Payments
Invoices
Reviews
Maintenance
Contract templates
Sample contracts
Notifications

Test credentials must be documented in README.

Never use production passwords in seed data.
60. PROJECT STRUCTURE

Backend:

backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── cars/
│   ├── categories/
│   ├── locations/
│   ├── bookings/
│   ├── pricing/
│   ├── payments/
│   ├── invoices/
│   ├── services/
│   ├── discounts/
│   ├── documents/
│   ├── contracts/
│   ├── signatures/
│   ├── inspections/
│   ├── maintenance/
│   ├── vehicle-release/
│   ├── reviews/
│   ├── notifications/
│   ├── reports/
│   ├── audit/
│   ├── storage/
│   ├── common/
│   ├── config/
│   └── main.ts
│

│
├── test/
├── .env.example
├── Dockerfile
└── package.json

Frontend:

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── api/
│   ├── types/
│   ├── utils/
│   ├── contexts/
│   ├── routes/
│   ├── features/
│   │   ├── auth/
│   │   ├── cars/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── contracts/
│   │   ├── signatures/
│   │   ├── documents/
│   │   └── vehicle-release/
│   └── App
│
├── .env.example
└── package.json
61. BUSINESS LOGIC LOCATION

Do NOT put business logic inside React components.

Frontend:

UI
 ↓
Hooks / Query Layer
 ↓
API Service

Backend:

Controller
 ↓
DTO / Validation
 ↓
Guard / Authorization
 ↓
Service
 ↓
Repository / Prisma
 ↓
PostgreSQL

Controllers must remain thin.

Services contain business rules.

62. AUDIT LOGGING

Audit sensitive actions.

Examples:

USER_CREATED
USER_UPDATED
ROLE_CHANGED

BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_CANCELLED

PAYMENT_CREATED
PAYMENT_VERIFIED
PAYMENT_REFUNDED

CONTRACT_GENERATED
CONTRACT_SIGNED
CONTRACT_UPLOADED
CONTRACT_APPROVED
CONTRACT_REJECTED

VEHICLE_RELEASE_AUTHORIZED
VEHICLE_PICKED_UP
VEHICLE_RETURNED

VEHICLE_STATUS_CHANGED
MAINTENANCE_CREATED

Audit logs should not be editable through normal application UI.

63. REPORTING

Admin reports should include:

Revenue
Bookings
Vehicle utilization
Most rented vehicles
Customer activity
Cancellation rate
Payment status
Outstanding payments
Maintenance cost
Contract status
Contract rejection rate
Vehicle release blocks
Rental duration
Location performance

Reports must use backend queries.

Do not calculate large reports entirely in React.

64. ERROR HANDLING

Use centralized exception handling.

Never expose:

Database stack trace
SQL errors
JWT secrets
Internal filesystem paths
Private storage URLs

Return useful user-safe messages.

Log technical details securely on the backend.

65. ENVIRONMENT VARIABLES

Use .env.

Example:

DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=

CORS_ORIGIN=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

PAYMENT_PROVIDER=
PAYMENT_SECRET=

Never commit actual secrets.

66. DOCUMENTATION

Create a comprehensive README containing:

Project overview
Architecture
Technology stack
Requirements
Installation
Environment variables
Database setup
Prisma migrations
Seed commands
Development commands
API documentation
Authentication
RBAC
Booking lifecycle
Contract lifecycle
Signature workflow
Vehicle release workflow
Testing
Deployment
Production configuration

Also document the state machines.

67. DEVELOPMENT PROCESS

Do NOT generate the entire system blindly in one giant step.

Work in controlled phases.

Phase 1

Requirements analysis.

Phase 2

Architecture design.

Phase 3

Database schema.

Phase 4

NestJS backend setup.

Phase 5

React frontend setup.

Phase 6

Authentication and RBAC.

Phase 7

Users, roles, permissions.

Phase 8

Vehicle/category/location management.

Phase 9

Availability engine.

Phase 10

Booking system.

Phase 11

Pricing and services.

Phase 12

Payments and invoices.

Phase 13

Customer documents.

Phase 14

Contract template system.

Phase 15

Contract generation.

Phase 16

Contract viewing/download.

Phase 17

Electronic signature.

Phase 18

Signed-contract upload.

Phase 19

Admin contract verification.

Phase 20

Notifications.

Phase 21

Vehicle release authorization.

Phase 22

Pickup/inspection.

Phase 23

Return/inspection.

Phase 24

Maintenance.

Phase 25

Reviews.

Phase 26

Admin/staff dashboards.

Phase 27

Customer frontend.

Phase 28

Reports.

Phase 29

Security hardening.

Phase 30

Automated testing.

Phase 31

Performance optimization.

Phase 32

Deployment/documentation.

68. AFTER EVERY PHASE

Before moving forward:

Run application
Run lint
Run tests
Check database migrations
Verify APIs
Verify frontend routes
Check browser console
Check backend logs
Check authorization
Check database integrity
Fix critical errors
Perform self-review

Do NOT continue if critical functionality is broken.

69. AI SELF-REVIEW REQUIREMENT

Before declaring a feature complete, AI must ask:

Does the backend enforce this rule?
Does the frontend handle loading?
Does the frontend handle errors?
Does the database enforce integrity?
Can a malicious user bypass this?
Can two users perform this simultaneously?
Are permissions correct?
Are sensitive files protected?
Are audit logs generated?
Are tests present?
Is the feature actually connected to the backend?

If the answer is no, the feature is NOT complete.

70. NO FAKE COMPLETION

Never say:

Feature complete

if:

Button does nothing
API is missing
Database model is missing
Signature is fake
Contract is static
Payment is simulated
Authorization exists only in React
Uploaded documents are publicly accessible
Vehicle release can bypass requirements
Tests are missing for critical business logic

The system must actually work end-to-end.

71. CRITICAL END-TO-END RENTAL FLOW

The complete rental workflow must support:

Customer Registration
        ↓
OTP Verification
        ↓
Login
        ↓
Browse Vehicles
        ↓
Select Vehicle
        ↓
Select Pickup/Return
        ↓
Check Availability
        ↓
Calculate Price
        ↓
Create Booking
        ↓
Payment
        ↓
Upload/Complete Required Documents
        ↓
Documents Verified
        ↓
Generate Rental Contract
        ↓
Customer Reviews Contract
        ↓
       ┌─────────────────────────┐
       │                         │
       ↓                         ↓
Download Contract          Sign Online
       ↓                         ↓
Sign Offline               E-Sign
       ↓                         ↓
Upload Signed Contract           │
       └────────────┬────────────┘
                    ↓
             Contract Submitted
                    ↓
              Admin Notification
                    ↓
              Admin Review
                    ↓
              ┌─────────────┐
              │             │
              ↓             ↓
           APPROVED      REJECTED
              │             │
              │             ↓
              │       Customer Re-signs
              │
              ↓
      Vehicle Release Checklist
              ↓
      Payment Verified
              ↓
      Documents Verified
              ↓
      Contract Approved
              ↓
      Vehicle Available
              ↓
      Release Authorized
              ↓
      Pickup Inspection
              ↓
      Vehicle Handover
              ↓
           PICKED_UP
              ↓
            ACTIVE
              ↓
        Vehicle Returned
              ↓
        Return Inspection
              ↓
      Additional Charges
              ↓
          RETURNED
              ↓
          COMPLETED
              ↓
       Customer Review

This entire flow must be implemented as actual backend-enforced business logic.

