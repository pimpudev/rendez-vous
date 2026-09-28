create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  age smallint not null check (age between 1 and 120),
  email text not null,
  french_levels text[] not null default array[]::text[],
  professional_status text[] not null default array[]::text[],
  enrolled_in_school boolean not null default false,
  interests text not null default '',
  discovery_sources text[] not null default array[]::text[],
  desired_duration text[] not null default array[]::text[],
  weekly_hours text[] not null default array[]::text[],
  availability_periods text[] not null default array[]::text[],
  available_immediately boolean not null default false,
  available_from date,
  available_until date,
  no_deadline boolean not null default false,
  payment_methods text[] not null default array[]::text[],
  comment text not null default '',
  offer text not null default '',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  course_status text not null default 'unassigned'
    check (course_status in ('unassigned', 'individual', 'group_pending', 'group_assigned')),
  group_name text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  constraint assigned_group_has_name check (
    (course_status = 'group_assigned' and nullif(btrim(group_name), '') is not null)
    or (course_status <> 'group_assigned')
  )
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

alter table public.admin_users enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Admins can read their own membership" on public.admin_users;
create policy "Admins can read their own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public can submit new reservations" on public.reservations;
create policy "Public can submit new reservations"
  on public.reservations for insert to anon, authenticated
  with check (
    payment_status = 'pending'
    and course_status = 'unassigned'
    and group_name is null
    and is_demo = false
  );

drop policy if exists "Admins can read reservations" on public.reservations;
create policy "Admins can read reservations"
  on public.reservations for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can update reservations" on public.reservations;
create policy "Admins can update reservations"
  on public.reservations for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.admin_users to authenticated;
grant insert on public.reservations to anon, authenticated;
grant select, update on public.reservations to authenticated;
grant execute on function public.is_admin() to authenticated;

insert into public.reservations (
  id,
  first_name,
  last_name,
  age,
  email,
  french_levels,
  professional_status,
  enrolled_in_school,
  interests,
  discovery_sources,
  desired_duration,
  weekly_hours,
  availability_periods,
  available_immediately,
  no_deadline,
  payment_methods,
  offer,
  payment_status,
  course_status,
  is_demo
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Camille',
  'Martin',
  29,
  'camille.martin@example.com',
  array['A2', 'B1'],
  array['Travailleur'],
  false,
  'Cours libre – 3 compétences',
  array['un ami'],
  array['10 heures'],
  array['deux heures par semaine'],
  array['le week-end', 'le matin'],
  true,
  true,
  array['via UPI'],
  'Cours libre – 3 compétences',
  'pending',
  'group_pending',
  true
)
on conflict (id) do nothing;
