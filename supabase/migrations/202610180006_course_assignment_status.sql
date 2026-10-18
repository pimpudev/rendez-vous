alter table public.reservations
  add column if not exists assignment_status text not null default 'unassigned';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and conname = 'reservations_assignment_status_check'
  ) then
    alter table public.reservations
      add constraint reservations_assignment_status_check
      check (assignment_status in ('unassigned', 'individual_assigned', 'group_assigned'));
  end if;
end;
$$;

update public.reservations
set assignment_status = case
  when course_status = 'individual' then 'individual_assigned'
  when course_status = 'group_assigned' then 'group_assigned'
  else 'unassigned'
end
where assignment_status = 'unassigned';
