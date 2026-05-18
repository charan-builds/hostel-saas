-- Least-privilege cleanup for the private schema.
--
-- Earlier module migrations granted every private function to authenticated so
-- RLS policies could call helper predicates. That also exposed trigger and
-- sequence/counter helpers as directly executable RPC targets. The final state
-- should only allow authenticated users to execute private functions that are
-- referenced directly by RLS policies. SECURITY DEFINER public RPCs and
-- triggers continue to call the internal helpers through their owners.

revoke usage on schema private from public;
revoke usage on schema private from anon;
grant usage on schema private to authenticated;

revoke execute on all functions in schema private from public;
revoke execute on all functions in schema private from anon;
revoke execute on all functions in schema private from authenticated;

-- Prevent future private functions created by the migration owner from being
-- executable by PUBLIC unless a later migration grants them explicitly.
alter default privileges in schema private
  revoke execute on functions from public;

-- RLS policy predicates. These remain executable because policies are evaluated
-- as the requesting authenticated role and must be able to call them directly.
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.current_organization_id() to authenticated;
grant execute on function private.is_superadmin() to authenticated;
grant execute on function private.is_org_admin(uuid) to authenticated;
grant execute on function private.can_access_organization(uuid) to authenticated;
grant execute on function private.has_active_membership(
  uuid,
  uuid,
  public.saas_product,
  public.app_role[]
) to authenticated;
grant execute on function private.can_access_hostel_branch(uuid, uuid)
  to authenticated;
grant execute on function private.is_student_admin(uuid, uuid) to authenticated;
grant execute on function private.is_billing_admin(uuid, uuid) to authenticated;
grant execute on function private.is_notification_admin(
  uuid,
  uuid,
  public.saas_product
) to authenticated;
grant execute on function private.can_read_notice_board(
  uuid,
  uuid,
  public.saas_product,
  text,
  text,
  timestamptz
) to authenticated;
grant execute on function private.is_presence_admin(uuid, uuid) to authenticated;
grant execute on function private.is_student_self(uuid) to authenticated;
grant execute on function private.is_analytics_admin(uuid, uuid) to authenticated;

-- Internal helpers intentionally remain ungranted to anon/authenticated:
-- private.current_hostel_branch_id()
-- private.set_updated_at()
-- private.next_student_code(uuid, uuid)
-- private.set_student_code()
-- private.enforce_room_bed_capacity()
-- private.sync_room_bed_status_from_assignment()
-- private.next_billing_invoice_number(uuid, uuid, date)
-- private.next_billing_receipt_number(uuid, uuid, date)
-- private.recalculate_invoice_status(uuid)
-- private.billing_payment_result(uuid, uuid, boolean)
comment on schema private is
  'Internal helpers. Authenticated users only receive explicit EXECUTE grants for functions referenced directly by RLS policies.';
