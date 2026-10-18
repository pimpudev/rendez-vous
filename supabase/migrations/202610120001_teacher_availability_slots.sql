create table if not exists public.teacher_availability_slots (
  slot text primary key,
  created_at timestamptz not null default now()
);

alter table public.teacher_availability_slots enable row level security;

drop policy if exists "Public can read teacher availability" on public.teacher_availability_slots;
create policy "Public can read teacher availability"
  on public.teacher_availability_slots for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage teacher availability" on public.teacher_availability_slots;
create policy "Admins can manage teacher availability"
  on public.teacher_availability_slots for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.teacher_availability_slots to anon, authenticated;
grant insert, delete on public.teacher_availability_slots to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'teacher_availability_slots'
    ) then
    alter publication supabase_realtime add table public.teacher_availability_slots;
  end if;
end;
$$;

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

drop trigger if exists validate_reservation_availability on public.reservations;
create trigger validate_reservation_availability
  before insert on public.reservations
  for each row execute function public.validate_reservation_availability();