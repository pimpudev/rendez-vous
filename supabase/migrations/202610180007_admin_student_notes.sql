create table if not exists public.admin_student_notes (
  student_email text primary key check (
    student_email = lower(btrim(student_email))
    and student_email <> ''
  ),
  note text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.admin_student_notes enable row level security;

drop policy if exists "Admins can manage student notes" on public.admin_student_notes;
create policy "Admins can manage student notes"
  on public.admin_student_notes for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select, insert, update, delete on public.admin_student_notes to authenticated;
