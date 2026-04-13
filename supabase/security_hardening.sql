-- Tea Spill security hardening migration
-- Run this in Supabase SQL editor before enabling live moderation in production.

create extension if not exists pgcrypto;

-- ===== Helper: admin check =====
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_id = auth.uid()
      and coalesce(u.is_admin, false) = true
  );
$$;

grant execute on function public.is_admin_user() to authenticated;

-- ===== Admin audit logs =====
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_auth_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at
on public.admin_audit_logs(created_at desc);

create index if not exists idx_admin_audit_logs_action_type
on public.admin_audit_logs(action_type);

alter table public.admin_audit_logs enable row level security;

drop policy if exists admin_audit_logs_select_admin on public.admin_audit_logs;
create policy admin_audit_logs_select_admin
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin_user());

drop policy if exists admin_audit_logs_insert_admin on public.admin_audit_logs;
create policy admin_audit_logs_insert_admin
on public.admin_audit_logs
for insert
to authenticated
with check (public.is_admin_user() and auth.uid() = admin_auth_id);

create or replace function public.log_admin_action(
  p_action_type text,
  p_target_type text,
  p_target_id text default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  insert into public.admin_audit_logs (
    admin_auth_id,
    action_type,
    target_type,
    target_id,
    details
  )
  values (
    v_admin_id,
    coalesce(nullif(trim(p_action_type), ''), 'unknown_action'),
    coalesce(nullif(trim(p_target_type), ''), 'unknown_target'),
    p_target_id,
    coalesce(p_details, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.log_admin_action(text, text, text, jsonb) to authenticated;

-- ===== Storage: verification ID bucket lockdown =====
insert into storage.buckets (id, name, public)
values ('verification_ids', 'verification_ids', false)
on conflict (id) do update set public = false;

drop policy if exists "Authenticated users can upload IDs" on storage.objects;
drop policy if exists "Only admins can view IDs" on storage.objects;
drop policy if exists verification_ids_upload_authenticated on storage.objects;
drop policy if exists verification_ids_select_admin_only on storage.objects;
drop policy if exists verification_ids_update_admin_only on storage.objects;
drop policy if exists verification_ids_delete_admin_only on storage.objects;

create policy verification_ids_upload_authenticated
on storage.objects
for insert
to authenticated
with check (bucket_id = 'verification_ids');

create policy verification_ids_select_admin_only
on storage.objects
for select
to authenticated
using (bucket_id = 'verification_ids' and public.is_admin_user());

create policy verification_ids_update_admin_only
on storage.objects
for update
to authenticated
using (bucket_id = 'verification_ids' and public.is_admin_user())
with check (bucket_id = 'verification_ids' and public.is_admin_user());

create policy verification_ids_delete_admin_only
on storage.objects
for delete
to authenticated
using (bucket_id = 'verification_ids' and public.is_admin_user());

-- ===== RLS: users =====
alter table if exists public.users enable row level security;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
on public.users
for select
using (auth.uid() = auth_id or public.is_admin_user());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
on public.users
for update
using (auth.uid() = auth_id or public.is_admin_user())
with check (auth.uid() = auth_id or public.is_admin_user());

-- ===== RLS: spills =====
alter table if exists public.spills enable row level security;

drop policy if exists spills_select_authenticated on public.spills;
create policy spills_select_authenticated
on public.spills
for select
to authenticated
using (true);

drop policy if exists spills_insert_verified_user on public.spills;
create policy spills_insert_verified_user
on public.spills
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.users u
    where u.auth_id = auth.uid()
      and u.verification_status = 'verified'
  )
  and (
    select count(*)
    from public.spills s
    where s.user_id = auth.uid()
      and s.created_at >= now() - interval '5 minutes'
  ) < 5
  and (
    select count(*)
    from public.spills s
    where s.user_id = auth.uid()
      and s.created_at >= now() - interval '1 day'
  ) < 80
);

drop policy if exists spills_update_owner_or_admin on public.spills;
create policy spills_update_owner_or_admin
on public.spills
for update
to authenticated
using (auth.uid() = user_id or public.is_admin_user())
with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists spills_delete_owner_or_admin on public.spills;
create policy spills_delete_owner_or_admin
on public.spills
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin_user());

-- ===== RLS: comments =====
alter table if exists public.comments enable row level security;

drop policy if exists comments_select_authenticated on public.comments;
create policy comments_select_authenticated
on public.comments
for select
to authenticated
using (true);

drop policy if exists comments_insert_verified_user on public.comments;
create policy comments_insert_verified_user
on public.comments
for insert
to authenticated
with check (
  auth.uid() = auth_id
  and exists (
    select 1
    from public.users u
    where u.auth_id = auth.uid()
      and u.verification_status = 'verified'
  )
  and (
    select count(*)
    from public.comments c
    where c.auth_id = auth.uid()
      and c.created_at >= now() - interval '5 minutes'
  ) < 30
  and (
    select count(*)
    from public.comments c
    where c.auth_id = auth.uid()
      and c.created_at >= now() - interval '1 day'
  ) < 300
);

drop policy if exists comments_delete_owner_or_admin on public.comments;
create policy comments_delete_owner_or_admin
on public.comments
for delete
to authenticated
using (auth.uid() = auth_id or public.is_admin_user());

-- ===== Reports table =====
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  spill_id text not null,
  auth_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

create index if not exists idx_reports_status_created_at on public.reports(status, created_at desc);
create index if not exists idx_reports_spill_id on public.reports(spill_id);

alter table public.reports enable row level security;

drop policy if exists reports_insert_authenticated on public.reports;
create policy reports_insert_authenticated
on public.reports
for insert
to authenticated
with check (
  auth.uid() = auth_id
  and (
    select count(*)
    from public.reports r
    where r.auth_id = auth.uid()
      and r.created_at >= now() - interval '1 hour'
  ) < 20
  and not exists (
    select 1
    from public.reports r
    where r.auth_id = auth.uid()
      and r.spill_id = reports.spill_id
      and r.status = 'open'
  )
);

drop policy if exists reports_admin_select on public.reports;
create policy reports_admin_select
on public.reports
for select
to authenticated
using (public.is_admin_user());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update
on public.reports
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

-- ===== Reaction ledger for atomic counters =====
create table if not exists public.spill_reactions (
  spill_id text not null,
  auth_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('sip', 'fire', 'shook', 'dead', 'cap')),
  created_at timestamptz not null default now(),
  primary key (spill_id, auth_id, reaction)
);

create index if not exists idx_spill_reactions_spill_id on public.spill_reactions(spill_id);

alter table public.spill_reactions enable row level security;

drop policy if exists spill_reactions_insert_own on public.spill_reactions;
create policy spill_reactions_insert_own
on public.spill_reactions
for insert
to authenticated
with check (auth.uid() = auth_id);

drop policy if exists spill_reactions_select_own_or_admin on public.spill_reactions;
create policy spill_reactions_select_own_or_admin
on public.spill_reactions
for select
to authenticated
using (auth.uid() = auth_id or public.is_admin_user());

create or replace function public.set_spill_reaction(
  p_spill_id text,
  p_reaction text
)
returns table(reactions jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if (
    select count(*)
    from public.spill_reactions r
    where r.auth_id = v_user_id
      and r.created_at >= now() - interval '1 minute'
  ) >= 120 then
    raise exception 'Rate limit exceeded for reactions';
  end if;

  if p_reaction not in ('sip', 'fire', 'shook', 'dead', 'cap') then
    raise exception 'Invalid reaction';
  end if;

  if not exists (
    select 1
    from public.users u
    where u.auth_id = v_user_id
      and u.verification_status = 'verified'
  ) then
    raise exception 'Verified users only';
  end if;

  insert into public.spill_reactions (spill_id, auth_id, reaction)
  values (p_spill_id, v_user_id, p_reaction)
  on conflict do nothing;

  update public.spills s
  set reactions = jsonb_build_object(
    'sip',   coalesce((select count(*)::int from public.spill_reactions r where r.spill_id = p_spill_id and r.reaction = 'sip'), 0),
    'fire',  coalesce((select count(*)::int from public.spill_reactions r where r.spill_id = p_spill_id and r.reaction = 'fire'), 0),
    'shook', coalesce((select count(*)::int from public.spill_reactions r where r.spill_id = p_spill_id and r.reaction = 'shook'), 0),
    'dead',  coalesce((select count(*)::int from public.spill_reactions r where r.spill_id = p_spill_id and r.reaction = 'dead'), 0),
    'cap',   coalesce((select count(*)::int from public.spill_reactions r where r.spill_id = p_spill_id and r.reaction = 'cap'), 0)
  )
  where s.spill_id = p_spill_id;

  return query
  select coalesce(s.reactions, '{}'::jsonb)
  from public.spills s
  where s.spill_id = p_spill_id;
end;
$$;

grant execute on function public.set_spill_reaction(text, text) to authenticated;

-- ===== Admin RPCs =====
create or replace function public.admin_set_user_status(
  p_target_auth_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  if p_status not in ('unverified', 'pending', 'verified', 'rejected', 'banned') then
    raise exception 'Invalid verification status';
  end if;

  update public.users
  set verification_status = p_status
  where auth_id = p_target_auth_id;

  if not found then
    raise exception 'Target user not found';
  end if;

  perform public.log_admin_action(
    'user_status_update',
    'user',
    p_target_auth_id::text,
    jsonb_build_object('status', p_status)
  );

  return true;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, text) to authenticated;

create or replace function public.admin_delete_spill(
  p_spill_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  delete from public.comments where spill_id = p_spill_id;
  delete from public.reports where spill_id = p_spill_id;
  delete from public.spills where spill_id = p_spill_id;

  perform public.log_admin_action(
    'spill_delete',
    'spill',
    p_spill_id,
    jsonb_build_object('reason', 'admin_delete')
  );

  return true;
end;
$$;

grant execute on function public.admin_delete_spill(text) to authenticated;

create or replace function public.admin_delete_comment(
  p_comment_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  delete from public.comments
  where id::text = p_comment_id;

   if found then
     perform public.log_admin_action(
       'comment_delete',
       'comment',
       p_comment_id,
       jsonb_build_object('reason', 'admin_delete')
     );
   end if;

  return found;
end;
$$;

grant execute on function public.admin_delete_comment(text) to authenticated;

create or replace function public.admin_resolve_report(
  p_report_id uuid,
  p_status text default 'resolved'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  if p_status not in ('resolved', 'dismissed') then
    raise exception 'Invalid report status';
  end if;

  update public.reports
  set
    status = p_status,
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_report_id
    and status = 'open';

  if not found then
    return false;
  end if;

  perform public.log_admin_action(
    'report_resolve',
    'report',
    p_report_id::text,
    jsonb_build_object('status', p_status)
  );

  return true;
end;
$$;

grant execute on function public.admin_resolve_report(uuid, text) to authenticated;

create or replace function public.get_admin_users(p_status text default null)
returns table (
  id uuid,
  auth_id uuid,
  username text,
  real_name text,
  email text,
  college_name text,
  department text,
  section text,
  dob date,
  id_url text,
  verification_status text,
  is_admin boolean
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.auth_id,
    u.username,
    u.real_name,
    au.email,
    u.college_name,
    u.department,
    u.section,
    u.dob,
    u.id_url,
    u.verification_status,
    coalesce(u.is_admin, false) as is_admin
  from public.users u
  left join auth.users au on au.id = u.auth_id
  where public.is_admin_user()
    and (p_status is null or u.verification_status = p_status)
  order by u.created_at desc nulls last;
$$;

grant execute on function public.get_admin_users(text) to authenticated;

-- ===== Data retention helpers =====
create or replace function public.admin_cleanup_verification_ids(
  p_older_than_days integer default 30
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_count integer := 0;
begin
  if not public.is_admin_user() then
    raise exception 'Admin privileges required';
  end if;

  -- Clear references from finalized accounts.
  update public.users
  set id_url = null
  where id_url is not null
    and verification_status in ('verified', 'rejected', 'banned');

  -- Delete old objects from private verification bucket.
  with deleted as (
    delete from storage.objects o
    where o.bucket_id = 'verification_ids'
      and o.created_at < now() - make_interval(days => greatest(p_older_than_days, 1))
    returning 1
  )
  select count(*) into v_deleted_count from deleted;

  perform public.log_admin_action(
    'verification_id_cleanup',
    'storage_bucket',
    'verification_ids',
    jsonb_build_object('older_than_days', p_older_than_days, 'deleted_count', v_deleted_count)
  );

  return v_deleted_count;
end;
$$;

grant execute on function public.admin_cleanup_verification_ids(integer) to authenticated;

-- Optional: schedule periodic cleanup with pg_cron if available.
-- select cron.schedule('verification-id-cleanup', '0 3 * * *', $$select public.admin_cleanup_verification_ids(30);$$);
