create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text unique not null,
  full_name text not null,
  course text,
  year_level text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_code text unique not null,
  title text not null,
  start timestamptz not null,
  "end" timestamptz not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint events_valid_window check ("end" > start)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  unique (student_id, event_id)
);

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

grant execute on function public.is_staff() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, student_id, full_name, course, year_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'student_id', new.id::text),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New user'),
    new.raw_user_meta_data ->> 'course',
    new.raw_user_meta_data ->> 'year_level'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated" on public.events
for select to authenticated using (true);

drop policy if exists "events_insert_staff" on public.events;
create policy "events_insert_staff" on public.events
for insert to authenticated
with check (created_by = auth.uid() and public.is_staff());

drop policy if exists "events_update_owner_or_admin" on public.events;
create policy "events_update_owner_or_admin" on public.events
for update to authenticated
using (created_by = auth.uid() or public.is_admin())
with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "events_delete_owner_or_admin" on public.events;
create policy "events_delete_owner_or_admin" on public.events
for delete to authenticated
using (created_by = auth.uid() or public.is_admin());

drop policy if exists "attendance_select_owner_event_staff_or_admin" on public.attendance;
create policy "attendance_select_owner_event_staff_or_admin" on public.attendance
for select to authenticated
using (
  student_id = auth.uid()
  or exists (select 1 from public.events e where e.id = event_id and e.created_by = auth.uid())
  or public.is_admin()
);

drop policy if exists "attendance_insert_own" on public.attendance;
create policy "attendance_insert_own" on public.attendance
for insert to authenticated
with check (student_id = auth.uid());

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert on public.attendance to authenticated;
