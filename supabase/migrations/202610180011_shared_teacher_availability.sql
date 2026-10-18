create or replace function public.validate_reservation_availability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_slot text;
begin
  if new.registration_type in (1, 3) then
    for requested_slot in
      select distinct unnest(coalesce(new.availability_slots, array[]::text[]))
    loop
      perform 1
      from public.teacher_availability_slots
      where slot = requested_slot
      for key share;

      if not found then
        raise exception 'The selected availability is no longer open';
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create or replace function public.finalize_reservation(
  p_reservation_id uuid,
  p_scheduled_slot text default null
)
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

  if reservation_row.registration_type = 1 then
    if p_scheduled_slot is null or not (p_scheduled_slot = any(coalesce(reservation_row.availability_slots, array[]::text[]))) then
      raise exception 'Choose one of the student’s proposed availability slots';
    end if;

    perform 1
    from public.teacher_availability_slots
    where slot = p_scheduled_slot
    for update;

    if not found then
      raise exception 'The selected individual slot is no longer available';
    end if;
  elsif p_scheduled_slot is not null then
    raise exception 'A specific scheduled slot is only assigned to individual courses';
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
    source_registration_id,
    scheduled_slot
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
    reservation_row.id,
    p_scheduled_slot
  )
  returning id into student_course_id;

  if p_scheduled_slot is not null then
    delete from public.teacher_availability_slots
    where slot = p_scheduled_slot;
  end if;

  delete from public.reservations where id = reservation_row.id;
  return student_course_id;
end;
$$;

revoke all on function public.finalize_reservation(uuid, text) from public;
grant execute on function public.finalize_reservation(uuid, text) to authenticated;