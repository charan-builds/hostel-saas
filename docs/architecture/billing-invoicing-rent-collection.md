# Billing, Invoicing, and Rent Collection

This module is scoped to `organization_id` and `hostel_branch_id` on every durable billing table. The branch key stays on invoices, payments, allocations, receipts, and rent plans so PostgreSQL RLS can authorize data without application joins, and composite foreign keys prevent cross-tenant UUID stitching.

## Data Model

- `rent_plans` define recurring monthly pricing at branch, room, bed, or student scope.
- `billing_invoices` are student-linked monthly obligations generated from active bed assignments.
- `billing_invoice_items` store rent, discounts, penalties, fines, and adjustments as ledger-style line items.
- `billing_payments` store manual/offline and future provider payments.
- `billing_payment_allocations` connects payments to invoices, which enables future split or bulk payment allocation.
- `billing_receipts` stores immutable receipt records tied one-to-one to payments.
- `billing_runs` stores monthly generation history and duplicate-run observability.
- `billing_invoice_counters` and `billing_receipt_counters` are private branch/year counters used by security-definer functions.

## Transaction Boundaries

Invoice generation and payment recording live in PostgreSQL RPC functions because uniqueness, counters, balance changes, and audit inserts must be atomic. The app layer validates input and authorizes intent, while Postgres enforces final consistency.

Monthly duplicate invoices are prevented by the partial unique index on:

`organization_id, hostel_branch_id, student_id, rent_plan_id, invoice_month`

Payment over-allocation is prevented inside `record_invoice_payment`, which locks the invoice, recalculates balance, and rejects payments above the current balance.

## RLS Strategy

Billing admins can manage branch billing through `private.is_billing_admin`. Students can read their own invoices, items, payments, allocations, and receipts through student ownership policies. Counter tables have no direct authenticated access and are only mutated by private security-definer functions.

## Application Boundaries

- `backend/modules/billing/schemas.ts` owns Zod validation.
- `backend/modules/billing/billing.repository.ts` owns Supabase query construction.
- `backend/modules/billing/billing.service.ts` owns authorization, error mapping, RPC orchestration, and audit hooks.
- `backend/modules/billing/actions.ts` exposes secure server actions for App Router forms.
- `backend/app/api/v1/billing/*` exposes typed route-handler APIs for integrations.
- `backend/components/billing/*` keeps UI concerns out of the domain service.

## Cashfree Online Payment Orchestration

Cashfree is integrated as a provider layer on top of the existing billing ledger:

- `POST /api/v1/billing/invoices/[invoiceId]/payment-session` creates or reuses a Cashfree order for payable invoices.
- `POST /api/webhooks/cashfree` verifies the Cashfree raw-body signature before recording payment.
- Provider code lives under `backend/lib/payments/providers/cashfree/`, behind the generic `backend/lib/payments/payment-provider.ts` boundary.
- Cashfree callbacks never mark invoices as paid from the browser return URL. Only the verified webhook calls `record_invoice_payment`.
- Webhook finalization uses the existing provider reference, provider event ID, and idempotency indexes, so repeated webhook deliveries return the original payment instead of double-recording money.

The provider layer is intentionally small so Razorpay, Stripe, or PhonePe can be added later without changing invoice, allocation, receipt, or audit tables.

## Extensibility

The current implementation is hostel-specific because invoices are occupancy-linked, but the rent-plan and invoice/payment/receipt tables are generic enough for clothing, gym, and inventory ERP modules. Future products should add product-specific source tables and generate invoice items into this same billing ledger rather than duplicating payment logic.
