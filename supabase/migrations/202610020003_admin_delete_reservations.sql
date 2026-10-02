drop policy if exists "Admins can delete reservations" on public.reservations;
create policy "Admins can delete reservations"
  on public.reservations for delete to authenticated
  using ((select public.is_admin()));

grant delete on public.reservations to authenticated;
