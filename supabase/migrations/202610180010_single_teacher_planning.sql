-- Keep the existing individual slot when a slot is currently open for both types.
delete from public.teacher_availability_slots as group_slot
using public.teacher_availability_slots as individual_slot
where group_slot.course_type = 'group'
  and individual_slot.course_type = 'individual'
  and group_slot.slot = individual_slot.slot;

alter table public.teacher_availability_slots
  drop constraint if exists teacher_availability_slots_pkey;

alter table public.teacher_availability_slots
  add constraint teacher_availability_slots_pkey primary key (slot);
