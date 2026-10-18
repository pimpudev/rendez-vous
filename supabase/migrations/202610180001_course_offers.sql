create table if not exists public.course_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('individual', 'group')),
  name_fr text not null,
  name_en text not null default '',
  name_es text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  description_es text not null default '',
  price_inr numeric(10, 2) not null check (price_inr >= 0),
  price_eur numeric(10, 2) not null check (price_eur >= 0),
  requirements text[] not null default array[]::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_offers enable row level security;

drop policy if exists "Public can read active course offers" on public.course_offers;
create policy "Public can read active course offers"
  on public.course_offers for select to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage course offers" on public.course_offers;
create policy "Admins can manage course offers"
  on public.course_offers for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.course_offers to anon, authenticated;
grant insert, update on public.course_offers to authenticated;

insert into public.course_offers (
  slug, category, name_fr, name_en, name_es,
  description_fr, description_en, description_es,
  price_inr, price_eur, requirements
)
values
  (
    'individuel-professionnel', 'individual',
    'Professionnel – 1 à 4 compétences', 'Professional – 1 to 4 skills', 'Profesional – 1 a 4 competencias',
    'Un accompagnement individuel adapté à vos objectifs professionnels. Choisissez de travailler de 1 à 4 compétences du français selon vos besoins.',
    'Individual support tailored to your professional goals. Choose to work on 1 to 4 French skills according to your needs.',
    'Acompañamiento individual adaptado a tus objetivos profesionales. Elige trabajar de 1 a 4 competencias del francés según tus necesidades.',
    3000, 30, array[]::text[]
  ),
  (
    'individuel-delf-dalf', 'individual',
    'DELF DALF – 4 compétences', 'DELF DALF – 4 skills', 'DELF DALF – 4 competencias',
    'Préparez les examens DELF et DALF à votre rythme, avec un entraînement complet sur les quatre compétences évaluées.',
    'Prepare for the DELF and DALF exams at your own pace, with complete practice in all four assessed skills.',
    'Prepara los exámenes DELF y DALF a tu ritmo, con una práctica completa de las cuatro competencias evaluadas.',
    2500, 25, array[]::text[]
  ),
  (
    'individuel-cours-libre', 'individual',
    'Cours libre – 3 compétences', 'Open course – 3 skills', 'Curso libre – 3 competencias',
    'Un cours à la carte, construit autour de vos objectifs, de vos centres d’intérêt et des situations que vous souhaitez travailler.',
    'A flexible course built around your goals, interests, and the situations you want to practise.',
    'Un curso flexible, diseñado en torno a tus objetivos, intereses y las situaciones que quieres trabajar.',
    2500, 25, array[]::text[]
  ),
  (
    'individuel-conversation', 'individual',
    'Conversation – 2 compétences', 'Conversation – 2 skills', 'Conversación – 2 competencias',
    'Un cours individuel centré sur l’échange oral pour pratiquer le français, gagner en aisance et développer votre spontanéité.',
    'An individual course focused on speaking practice to build confidence and spontaneity in French.',
    'Un curso individual centrado en la conversación para practicar francés, ganar soltura y expresarte con espontaneidad.',
    2000, 20, array[]::text[]
  ),
  (
    'groupe-delf-a1-a2-b1', 'group',
    'DELF A1-A2-B1 – 4 compétences', 'DELF A1-A2-B1 – 4 skills', 'DELF A1-A2-B1 – 4 competencias',
    'Une préparation aux examens DELF A1, A2 et B1 en petit groupe, avec un travail équilibré des quatre compétences.',
    'Prepare for the DELF A1, A2, and B1 exams in a small group, with balanced practice in all four skills.',
    'Preparación para los exámenes DELF A1, A2 y B1 en un grupo pequeño, con práctica equilibrada de las cuatro competencias.',
    1000, 10, array['Minimum 4 étudiants / Maximum 10 étudiants', 'Minimum 10 heures']::text[]
  ),
  (
    'groupe-delf-b2-dalf-c1-c2', 'group',
    'DELF B2 - DALF C1-C2 – 4 compétences', 'DELF B2 - DALF C1-C2 – 4 skills', 'DELF B2 - DALF C1-C2 – 4 competencias',
    'Une préparation aux examens DELF B2 et DALF C1-C2 en petit groupe, avec un travail approfondi des quatre compétences.',
    'Prepare for the DELF B2 and DALF C1-C2 exams in a small group, with in-depth practice in all four skills.',
    'Preparación para los exámenes DELF B2 y DALF C1-C2 en un grupo pequeño, con trabajo en profundidad de las cuatro competencias.',
    1500, 15, array['Minimum 4 étudiants / Maximum 10 étudiants', 'Minimum 10 heures']::text[]
  ),
  (
    'groupe-cours-libre', 'group',
    'Cours libre – 3 compétences', 'Open course – 3 skills', 'Curso libre – 3 competencias',
    'Un cours libre en petit groupe, construit autour des objectifs et des sujets choisis par les étudiants.',
    'A small-group course built around the goals and topics chosen by its students.',
    'Un curso en grupo pequeño basado en los objetivos y temas elegidos por los estudiantes.',
    1000, 10, array['Minimum 4 étudiants / Maximum 10 étudiants', 'Minimum 10 heures']::text[]
  ),
  (
    'groupe-conversation', 'group',
    'Conversation – 2 compétences', 'Conversation – 2 skills', 'Conversación – 2 competencias',
    'Un cours de conversation en petit groupe pour pratiquer le français, gagner en aisance et échanger dans une ambiance conviviale.',
    'A small-group conversation course to practise French, build confidence, and connect in a friendly setting.',
    'Un curso de conversación en grupo pequeño para practicar francés, ganar soltura y conversar en un ambiente agradable.',
    800, 8, array['Minimum 4 étudiants / Maximum 10 étudiants', 'Minimum 10 heures']::text[]
  )
on conflict (slug) do nothing;

create or replace function public.sync_course_offer_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  if old.name_fr is distinct from new.name_fr then
    update public.course_groups
    set offer = new.name_fr
    where offer = old.name_fr;
  end if;

  if old.is_active and not new.is_active then
    update public.course_groups
    set is_open = false
    where offer = new.name_fr and is_open = true;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_course_offer_changes on public.course_offers;
create trigger sync_course_offer_changes
  before update on public.course_offers
  for each row execute function public.sync_course_offer_changes();