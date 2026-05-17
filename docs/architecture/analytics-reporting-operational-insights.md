# Analytics, Reporting, and Operational Insights

The analytics module is built as a read-optimized layer over the operational tables. It uses tenant-scoped PostgreSQL views for live dashboard data, a service-role-only materialized snapshot for future scheduled refreshes, and shared service functions for pages, API routes, and exports.

## Data Sources

- `analytics_branch_occupancy` aggregates rooms, beds, active assignments, available beds, and occupancy rate per branch.
- `analytics_billing_branch_summary` aggregates invoices, pending dues, overdue dues, paid totals, and open invoices.
- `analytics_revenue_daily` aggregates payment collections by day and branch.
- `analytics_attendance_daily` aggregates attendance status counts by day.
- `analytics_leave_daily` aggregates leave status and leave type counts by day.
- `analytics_visitor_daily` aggregates visitor pass status counts by day.
- `analytics_notification_summary` aggregates unread, delivered, dismissed, and failed notification recipient states.
- `analytics_monthly_branch_rollups` is a materialized cache for future background jobs and historical trend dashboards.

## Why Views

Views keep recurring dashboard joins out of application code and make query plans easier to tune. The live views are created with `security_invoker = true`, so Supabase/PostgreSQL RLS still applies to the underlying tenant tables. The materialized view is not granted to authenticated users because materialized views do not enforce RLS the same way regular tables do.

## Authorization

The application layer requires `analytics:read` for dashboards and previews, and `report:export` for file exports. Admins receive these permissions by default; students do not. The refresh RPC uses `private.is_analytics_admin` and writes an audit log entry in the same database transaction.

## Export Design

Exports use the same report service as the UI and API. Excel exports are generated as SpreadsheetML (`.xls`) without adding runtime dependencies. PDF exports use a small server-side PDF renderer for table reports. Larger production exports can later move to `student_presence_jobs` or a dedicated reporting job table without changing the report filters or route contract.

## Query Optimization

The migration adds indexes for collection timelines, notification delivery summaries, and branch-scoped audit activity. Existing module indexes already cover room occupancy, invoices, attendance, leave, and visitor workflows.

## Extensibility

Future ERP products can reuse the module by adding product-specific views and keeping the same service contract: date range, tenant, branch, report type, format, and audit metadata. Dashboards should stay composable widgets backed by repository functions rather than page-local SQL.
