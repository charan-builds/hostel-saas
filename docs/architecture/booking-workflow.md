# Public Booking Workflow

The booking foundation is intentionally additive to the ERP modules. Public visitors never write directly to tenant tables from the browser. Public route handlers validate input, rate-limit requests, resolve the tenant/branch scope, and use server-only Supabase service-role access.

## Data Model

- `booking_requests`: public enquiry/reservation source of truth.
- `booking_status_history`: trigger-maintained lifecycle history.
- `booking_payments`: optional Cashfree advance/booking-fee tracking.
- `booking_notes`: admin follow-up notes and public contact messages.

Statuses: `pending`, `contacted`, `approved`, `rejected`, `expired`, `converted`, `cancelled`.

## Public APIs

- `GET /api/public/bookings/availability`
- `POST /api/public/bookings`
- `POST /api/public/bookings/contact`
- `POST /api/public/bookings/[bookingRequestId]/payment-session`

Public create responses include a one-time public access token. That token is required to create a booking payment session, so knowing a booking UUID is not enough to initiate payment activity.

## Admin APIs

- `GET /api/v1/bookings`
- `GET /api/v1/bookings/[bookingRequestId]`
- `PATCH /api/v1/bookings/[bookingRequestId]/status`
- `POST /api/v1/bookings/[bookingRequestId]/notes`
- `POST /api/v1/bookings/[bookingRequestId]/convert`

Admin access uses `booking:read` and `booking:manage`. Conversion runs through `public.convert_booking_to_student(...)` so student creation, optional bed assignment, booking status update, and audit logging happen in one database transaction.

## Payment Safety

Cashfree checkout can be created for booking advances, but browser redirects never finalize payment. The verified Cashfree webhook dispatches booking events by `order_tags.reference_type = "booking"` or a `b_` order prefix and marks `booking_payments.status = succeeded` only after signature verification.

## Future Public Website Support

The APIs support either direct organization/branch IDs or organization/branch slugs. Custom-domain routing can resolve the same scope server-side and call the existing services without changing the booking tables.
