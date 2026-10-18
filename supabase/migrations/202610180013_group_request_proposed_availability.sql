create or replace function public.validate_reservation_availability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_slot text;
begin
  if new.registration_type = 1 then
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