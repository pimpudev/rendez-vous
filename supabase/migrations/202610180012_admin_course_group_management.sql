alter table public.course_groups
  add column if not exists level_min text,
  add column if not exists level_max text,
  add column if not exists scheduled_slot text;

update public.course_groups
set scheduled_slot = (regexp_match(
  schedule_description,
  '(Lundi|Mardi|Mercredi|Jeudi|Vendredi)[[:space:]]+[0-2][0-9]:[0-5][0-9][[:space:]]*[–-][[:space:]]*[0-2][0-9]:[0-5][0-9]'
))[1]
where scheduled_slot is null
  and schedule_description ~ '(Lundi|Mardi|Mercredi|Jeudi|Vendredi)[[:space:]]+[0-2][0-9]:[0-5][0-9][[:space:]]*[–-][[:space:]]*[0-2][0-9]:[0-5][0-9]';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.course_groups'::regclass
      and conname = 'course_groups_level_range_check'
  ) then
    alter table public.course_groups
      add constraint course_groups_level_range_check
      check (
        (level_min is null and level_max is null)
        or (
          level_min = any(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[])
          and level_max = any(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[])
          and array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], level_min)
            <= array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], level_max)
        )
      );
  end if;
end;
$$;

create table if not exists public.course_group_members (
  group_id uuid not null references public.course_groups(id) on delete cascade,
  student_email text not null check (student_email = lower(btrim(student_email)) and student_email <> ''),
  first_name text not null,
  last_name text not null,
  added_at timestamptz not null default now(),
  primary key (group_id, student_email)
);

alter table public.course_group_members enable row level security;
drop policy if exists "Admins can manage course group members" on public.course_group_members;
create policy "Admins can manage course group members"
  on public.course_group_members for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
grant select, insert, update, delete on public.course_group_members to authenticated;

insert into public.course_group_members (group_id, student_email, first_name, last_name)
select distinct selected_group_id, student_email, first_name, last_name
from public.student_courses
where course_type = 'group' and selected_group_id is not null
on conflict (group_id, student_email) do update
set first_name = excluded.first_name, last_name = excluded.last_name;

create or replace function public.sync_course_group_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and old.course_type = 'group'
    and old.selected_group_id is not null
    and (new.course_type <> 'group' or new.selected_group_id is distinct from old.selected_group_id) then
    delete from public.course_group_members
    where group_id = old.selected_group_id
      and student_email = old.student_email;
  end if;

  if new.course_type = 'group' and new.selected_group_id is not null then
    insert into public.course_group_members (group_id, student_email, first_name, last_name)
    values (new.selected_group_id, new.student_email, new.first_name, new.last_name)
    on conflict (group_id, student_email) do update
    set first_name = excluded.first_name, last_name = excluded.last_name;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_course_group_member on public.student_courses;
create trigger sync_course_group_member
  after insert or update of course_type, selected_group_id, student_email, first_name, last_name
  on public.student_courses
  for each row execute function public.sync_course_group_member();

create or replace function public.prevent_course_schedule_overlap()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.scheduled_slot is null or btrim(new.scheduled_slot) = '' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.scheduled_slot, 0));

  if tg_table_name = 'course_groups' then
    if exists (
      select 1
      from public.student_courses
      where course_type = 'individual'
        and (
          scheduled_slot = new.scheduled_slot
          or (
            scheduled_slot is null
            and new.scheduled_slot = any(coalesce(availability_slots, array[]::text[]))
          )
        )
    ) or exists (
      select 1
      from public.course_groups
      where id <> new.id
        and (scheduled_slot = new.scheduled_slot or schedule_description = new.scheduled_slot)
    ) then
      raise exception 'The selected schedule overlaps another course';
    end if;
  elsif tg_table_name = 'student_courses' and new.course_type = 'individual' then
    if exists (
      select 1
      from public.course_groups
      where scheduled_slot = new.scheduled_slot or schedule_description = new.scheduled_slot
    ) then
      raise exception 'The selected schedule overlaps another course';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_group_schedule_overlap on public.course_groups;
create trigger prevent_group_schedule_overlap
  before insert or update of scheduled_slot on public.course_groups
  for each row execute function public.prevent_course_schedule_overlap();

drop trigger if exists prevent_individual_schedule_overlap on public.student_courses;
create trigger prevent_individual_schedule_overlap
  before insert or update of scheduled_slot, course_type on public.student_courses
  for each row execute function public.prevent_course_schedule_overlap();

create or replace function public.create_admin_course_group(
  p_offer text,
  p_group_name text,
  p_level_min text,
  p_level_max text,
  p_scheduled_slot text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required';
  end if;

  if not exists (
    select 1 from public.course_offers
    where category = 'group' and is_active = true and name_fr = p_offer
  ) then
    raise exception 'Choose an active group offer';
  end if;

  if array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], p_level_min)
       is null
    or array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], p_level_max)
       is null
    or array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], p_level_min)
       > array_position(array['COMPLETE BEGINNER', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']::text[], p_level_max) then
    raise exception 'Choose a valid level interval';
  end if;

  if p_scheduled_slot is null or btrim(p_scheduled_slot) = '' then
    raise exception 'Choose a schedule';
  end if;

  insert into public.course_groups (
    offer, group_name, schedule_description, scheduled_slot, level_min, level_max, is_open
  ) values (
    p_offer, btrim(p_group_name), p_scheduled_slot, p_scheduled_slot, p_level_min, p_level_max, true
  ) returning id into new_group_id;

  return new_group_id;
end;
$$;

create or replace function public.admin_add_course_group_member(
  p_group_id uuid,
  p_student_email text,
  p_first_name text,
  p_last_name text
)
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
    raise exception 'Student email is required';
  end if;
  if not exists (select 1 from public.course_groups where id = p_group_id) then
    raise exception 'Course group was not found';
  end if;

  insert into public.course_group_members (group_id, student_email, first_name, last_name)
  values (p_group_id, normalized_email, p_first_name, p_last_name)
  on conflict (group_id, student_email) do update
  set first_name = excluded.first_name, last_name = excluded.last_name;

  update public.student_courses
  set selected_group_id = p_group_id
  where student_email = normalized_email
    and course_type = 'group'
    and selected_group_id is null;
end;
$$;

create or replace function public.admin_remove_course_group_member(
  p_group_id uuid,
  p_student_email text,
  p_first_name text default null,
  p_last_name text default null
)
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

  delete from public.course_group_members
  where group_id = p_group_id and student_email = normalized_email;

  update public.student_courses
  set selected_group_id = null
  where selected_group_id = p_group_id and student_email = normalized_email;
end;
$$;

revoke all on function public.create_admin_course_group(text, text, text, text, text) from public;
revoke all on function public.admin_add_course_group_member(uuid, text, text, text) from public;
revoke all on function public.admin_remove_course_group_member(uuid, text, text, text) from public;
grant execute on function public.create_admin_course_group(text, text, text, text, text) to authenticated;
grant execute on function public.admin_add_course_group_member(uuid, text, text, text) to authenticated;
grant execute on function public.admin_remove_course_group_member(uuid, text, text, text) to authenticated;