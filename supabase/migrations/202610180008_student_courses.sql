create table if not exists public.student_courses (
  id uuid primary key default gen_random_uuid(),
  student_email text not null check (student_email = lower(btrim(student_email)) and student_email <> ''),
  first_name text not null,
  last_name text not null,
  course_type text not null check (course_type in ('individual', 'group')),
  offer text not null,
  offer_details text not null default '',
  availability_slots text[] not null default array[]::text[],
  selected_group_id uuid references public.course_groups(id) on delete set null,
  comment text not null default '',
  source_registration_id uuid not null unique,
  created_at timestamptz not null default now()
);

create index if not exists student_courses_normalized_email_idx
  on public.student_courses (student_email);

alter table public.student_courses enable row level security;

drop policy if exists "Admins can read student courses" on public.student_courses;
create policy "Admins can read student courses"
  on public.student_courses for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can delete student courses" on public.student_courses;
create policy "Admins can delete student courses"
  on public.student_courses for delete to authenticated
  using ((select public.is_admin()));

grant select, delete on public.student_courses to authenticated;

insert into public.student_courses (
  student_email,
  first_name,
  last_name,
  course_type,
  offer,
  offer_details,
  availability_slots,
  selected_group_id,
  comment,
  source_registration_id,
  created_at
)
select
  lower(btrim(email)),
  first_name,
  last_name,
  case when registration_type = 1 then 'individual' else 'group' end,
  offer,
  offer_details,
  availability_slots,
  selected_group_id,
  comment,
  id,
  created_at
from public.reservations
where student_status = 'enrolled'
  and is_demo = false
on conflict (source_registration_id) do nothing;

delete from public.reservations
where student_status = 'enrolled'
  and is_demo = false;

create or replace function public.finalize_reservation(p_reservation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
 as $$
declare
  reservation_row public.reservations%rowtype;
  student_course_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  select *
    into reservation_row
    from public.reservations
    where id = p_reservation_id
      and is_demo = false
    for update;

  if not found then
    raise exception 'Reservation was not found';
  end if;

  if reservation_row.student_status = 'enrolled' then
    raise exception 'Reservation is already finalized';
  end if;

  insert into public.student_courses (
    student_email,
    first_name,
    last_name,
    course_type,
    offer,
    offer_details,
    availability_slots,
    selected_group_id,
    comment,
    source_registration_id
  ) values (
    lower(btrim(reservation_row.email)),
    reservation_row.first_name,
    reservation_row.last_name,
    case when reservation_row.registration_type = 1 then 'individual' else 'group' end,
    reservation_row.offer,
    reservation_row.offer_details,
    reservation_row.availability_slots,
    reservation_row.selected_group_id,
    reservation_row.comment,
    reservation_row.id
  )
  returning id into student_course_id;

  delete from public.reservations where id = reservation_row.id;
  return student_course_id;
end;
$$;

create or replace function public.delete_student_records(p_student_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(coalesce(p_student_email, '')));
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if normalized_email = '' then
    raise exception 'Student e-mail is required';
  end if;

  delete from public.reservations
  where lower(btrim(email)) = normalized_email;

  delete from public.student_courses
  where student_email = normalized_email;

  delete from public.admin_student_notes
  where student_email = normalized_email;
end;
$$;

revoke all on function public.finalize_reservation(uuid) from public;
revoke all on function public.delete_student_records(text) from public;
grant execute on function public.finalize_reservation(uuid) to authenticated;
grant execute on function public.delete_student_records(text) to authenticated;
