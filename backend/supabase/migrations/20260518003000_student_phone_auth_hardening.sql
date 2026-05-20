-- Phone OTP login resolves students through a normalized phone stored in
-- metadata by the application layer. These indexes keep the lookup bounded
-- without changing the core student table shape or RLS design.
create index if not exists students_auth_phone_metadata_active_idx
  on public.students ((metadata->>'auth_phone_e164'))
  where deleted_at is null
    and status = 'active'
    and metadata ? 'auth_phone_e164';

create index if not exists students_phone_active_idx
  on public.students (phone)
  where deleted_at is null
    and status = 'active'
    and phone is not null;
