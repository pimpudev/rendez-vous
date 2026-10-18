alter table public.course_offers
  add column if not exists detail_points text[] not null default array[]::text[];

update public.course_offers
set detail_points = requirements
where cardinality(detail_points) = 0
  and cardinality(requirements) > 0;
