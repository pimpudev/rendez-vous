create table if not exists public.course_groups (
  id uuid primary key default gen_random_uuid(),
  offer text not null,
  group_name text not null,
  schedule_description text not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.course_groups enable row level security;

drop policy if exists "Public can read open course groups" on public.course_groups;
create policy "Public can read open course groups"
  on public.course_groups for select to anon, authenticated
  using (is_open = true);

drop policy if exists "Admins can read all course groups" on public.course_groups;
create policy "Admins can read all course groups"
  on public.course_groups for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can manage course groups" on public.course_groups;
create policy "Admins can manage course groups"
  on public.course_groups for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.course_groups to anon, authenticated;
grant insert, update, delete on public.course_groups to authenticated;

alter table public.reservations
  alter column age drop not null,
  add column if not exists french_level text,
  add column if not exists offer_details text not null default '',
  add column if not exists availability_slots text[] not null default array[]::text[],
  add column if not exists registration_type smallint,
  add column if not exists course_type text,
  add column if not exists student_status text,
  add column if not exists selected_group_id uuid references public.course_groups(id);

update public.reservations
set
  french_level = coalesce(french_level, french_levels[1]),
  offer_details = coalesce(offer_details, ''),
  registration_type = coalesce(
    registration_type,
    case
      when course_status = 'group_assigned' then 2
      when course_status = 'group_pending' then 3
      when course_status = 'individual' then 1
      when is_demo and course_type = 'group' then 3
      else 1
    end
  ),
  course_type = coalesce(
    course_type,
    case
      when course_status in ('group_pending', 'group_assigned') then 'group'
      else 'individual'
    end
  ),
  availability_slots = coalesce(availability_slots, array[]::text[]),
  student_status = coalesce(
    student_status,
    case
      when course_status = 'group_pending' then 'waitlist'
      when course_status = 'group_assigned' then 'to_validate'
      when payment_status = 'paid' then 'enrolled'
      else 'to_validate'
    end
  );

alter table public.reservations
  alter column registration_type set default 1,
  alter column registration_type set not null,
  alter column course_type set default 'individual',
  alter column course_type set not null,
  alter column student_status set default 'to_validate',
  alter column student_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_registration_type_check'
  ) then
    alter table public.reservations
      add constraint reservations_registration_type_check
      check (registration_type in (1, 2, 3));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_course_type_check'
  ) then
    alter table public.reservations
      add constraint reservations_course_type_check
      check (course_type in ('individual', 'group', 'individual_group'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_student_status_check'
  ) then
    alter table public.reservations
      add constraint reservations_student_status_check
      check (student_status in ('waitlist', 'to_validate', 'payment_pending', 'enrolled', 'paused', 'finished'));
  end if;

end;
$$;

update public.reservations
set
  french_level = 'B1',
  offer_details = E'Disponibilités : samedi 10:00–11:00, samedi 11:00–12:00',
  availability_slots = array['Samedi 10:00–11:00', 'Samedi 11:00–12:00'],
  registration_type = 3,
  course_type = 'group',
  student_status = 'waitlist'
where id = '00000000-0000-4000-8000-000000000001'
  and is_demo = true;

drop policy if exists "Public can submit new reservations" on public.reservations;
create policy "Public can submit new reservations"
  on public.reservations for insert to anon, authenticated
  with check (
    payment_status = 'pending'
    and course_status = 'unassigned'
    and group_name is null
    and is_demo = false
    and (registration_type = 2 or cardinality(availability_slots) > 0)
    and (
      (
        registration_type = 1
        and course_type = 'individual'
        and student_status = 'to_validate'
        and selected_group_id is null
        and cardinality(availability_slots) > 0
      )
      or
      (
        registration_type = 2
        and course_type = 'group'
        and student_status = 'to_validate'
        and selected_group_id is not null
        and exists (
          select 1
          from public.course_groups as open_group
          where open_group.id = reservations.selected_group_id
            and open_group.offer = reservations.offer
            and open_group.is_open = true
        )
      )
      or
      (
        registration_type = 3
        and course_type = 'group'
        and student_status = 'waitlist'
        and selected_group_id is null
        and cardinality(availability_slots) > 0
      )
    )
  );
