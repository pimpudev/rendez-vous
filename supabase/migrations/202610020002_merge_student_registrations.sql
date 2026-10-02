create index if not exists reservations_normalized_email_idx
  on public.reservations (lower(btrim(email)))
  where is_demo = false;

-- A student may submit several applications. Keep each application and its own status,
-- but store the aggregate course type on every row belonging to the same e-mail.
create or replace function public.submit_reservation(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_first_name text := btrim(coalesce(payload->>'first_name', ''));
  v_last_name text := btrim(coalesce(payload->>'last_name', ''));
  v_email text := lower(btrim(coalesce(payload->>'email', '')));
  v_french_level text := btrim(coalesce(payload->>'french_level', ''));
  v_offer text := btrim(coalesce(payload->>'offer', ''));
  v_registration_type smallint := nullif(payload->>'registration_type', '')::smallint;
  v_selected_group_id uuid := nullif(payload->>'selected_group_id', '')::uuid;
  v_availability_slots text[];
  v_offer_details text := btrim(coalesce(payload->>'offer_details', ''));
  v_comment text := btrim(coalesce(payload->>'comment', ''));
  v_group_name text;
  v_group_schedule text;
  v_course_type text;
  v_student_status text;
  v_reservation_id uuid;
begin
  if payload is null or jsonb_typeof(payload) is distinct from 'object' then
    raise exception 'Invalid reservation payload';
  end if;

  if v_first_name = '' or v_last_name = '' or v_email = '' or v_offer = '' then
    raise exception 'Name, e-mail, and offer are required';
  end if;

  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid e-mail address';
  end if;

  if v_french_level not in ('COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2') then
    raise exception 'Invalid French level';
  end if;

  if v_registration_type is null or v_registration_type not in (1, 2, 3) then
    raise exception 'Invalid registration type';
  end if;

  if coalesce(jsonb_typeof(payload->'availability_slots'), 'array') <> 'array' then
    raise exception 'Availability slots must be an array';
  end if;

  select coalesce(array_agg(slots.slot), array[]::text[])
    into v_availability_slots
    from jsonb_array_elements_text(coalesce(payload->'availability_slots', '[]'::jsonb)) as slots(slot);

  if v_registration_type in (1, 3) and cardinality(v_availability_slots) = 0 then
    raise exception 'At least one availability slot is required';
  end if;

  if v_registration_type in (1, 3) and v_selected_group_id is not null then
    raise exception 'This registration type cannot select an existing group';
  end if;

  if v_registration_type = 2 then
    if v_selected_group_id is null then
      raise exception 'An open group must be selected for registration type 2';
    end if;

    select group_name, schedule_description
      into v_group_name, v_group_schedule
      from public.course_groups
      where id = v_selected_group_id
        and offer = v_offer
        and is_open = true;

    if not found then
      raise exception 'The selected group is no longer open for this offer';
    end if;

    v_offer_details := format('Groupe %s – %s', v_group_name, v_group_schedule);
  end if;

  v_course_type := case when v_registration_type = 1 then 'individual' else 'group' end;
  v_student_status := case when v_registration_type = 3 then 'waitlist' else 'to_validate' end;

  insert into public.reservations (
    first_name,
    last_name,
    email,
    french_level,
    french_levels,
    offer,
    interests,
    offer_details,
    availability_slots,
    registration_type,
    course_type,
    student_status,
    selected_group_id,
    payment_status,
    course_status,
    group_name,
    comment,
    is_demo
  ) values (
    v_first_name,
    v_last_name,
    v_email,
    v_french_level,
    array[v_french_level],
    v_offer,
    v_offer,
    v_offer_details,
    v_availability_slots,
    v_registration_type,
    v_course_type,
    v_student_status,
    v_selected_group_id,
    'pending',
    'unassigned',
    null,
    v_comment,
    false
  )
  returning id into v_reservation_id;

  return v_reservation_id;
end;
$function$;

-- Demo-only second registration: one person now has an individual and a group request.
insert into public.reservations (
  id,
  first_name,
  last_name,
  email,
  french_level,
  french_levels,
  offer,
  interests,
  offer_details,
  availability_slots,
  registration_type,
  course_type,
  student_status,
  payment_status,
  course_status,
  comment,
  is_demo,
  created_at
)
values (
  '00000000-0000-4000-8000-000000000002',
  'Camille',
  'Martin',
  'camille.martin@example.com',
  'B1',
  array['B1'],
  'Professionnel – 1 à 4 compétences',
  'Professionnel – 1 à 4 compétences',
  E'Disponibilités : mardi 14:00–15:00',
  array['Mardi 14:00–15:00'],
  1,
  'individual',
  'to_validate',
  'pending',
  'unassigned',
  '',
  true,
  '2026-09-02T09:00:00Z'
)
on conflict (id) do nothing;

-- All public submissions must go through the validating, grouping function above.
drop policy if exists "Public can submit new reservations" on public.reservations;
revoke insert on public.reservations from anon, authenticated;
revoke all on function public.submit_reservation(jsonb) from public;
grant execute on function public.submit_reservation(jsonb) to anon, authenticated;
