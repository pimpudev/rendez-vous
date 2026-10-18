alter table public.course_offers
  add column if not exists requirements_fr text[] not null default array[]::text[],
  add column if not exists requirements_en text[] not null default array[]::text[],
  add column if not exists requirements_es text[] not null default array[]::text[],
  add column if not exists detail_points_fr text[] not null default array[]::text[],
  add column if not exists detail_points_en text[] not null default array[]::text[],
  add column if not exists detail_points_es text[] not null default array[]::text[];

update public.course_offers
set requirements_fr = requirements
where cardinality(requirements_fr) = 0 and cardinality(requirements) > 0;

update public.course_offers
set detail_points_fr = detail_points
where cardinality(detail_points_fr) = 0 and cardinality(detail_points) > 0;

update public.course_offers
set
  requirements_fr = array['Conversation détendue', 'Focus sur la prononciation et l’aisance orale']::text[],
  requirements_en = array['Relaxed conversation', 'Focus on pronunciation and speaking confidence']::text[],
  requirements_es = array['Conversación relajada', 'Enfoque en la pronunciación y la soltura oral']::text[],
  detail_points_fr = array['Focus sur la prononciation et l’aisance orale']::text[],
  detail_points_en = array['Focus on pronunciation and speaking confidence']::text[],
  detail_points_es = array['Enfoque en la pronunciación y la soltura oral']::text[]
where slug in ('individuel-conversation', 'groupe-conversation');

update public.course_offers
set
  requirements_fr = array['Documents authentiques', 'Grammaire', 'Sujets d’actualité', 'Débat']::text[],
  requirements_en = array['Authentic materials', 'Grammar', 'Current affairs', 'Debate']::text[],
  requirements_es = array['Documentos auténticos', 'Gramática', 'Temas de actualidad', 'Debate']::text[],
  detail_points_fr = array['Grammaire', 'Sujets d’actualité', 'Débat']::text[],
  detail_points_en = array['Grammar', 'Current affairs', 'Debate']::text[],
  detail_points_es = array['Gramática', 'Temas de actualidad', 'Debate']::text[]
where slug in ('individuel-cours-libre', 'groupe-cours-libre');

update public.course_offers
set
  requirements_fr = array['Préparation aux examens', 'DELF DALF', 'TCF', 'TEF']::text[],
  requirements_en = array['Exam preparation', 'DELF DALF', 'TCF', 'TEF']::text[],
  requirements_es = array['Preparación para los exámenes', 'DELF DALF', 'TCF', 'TEF']::text[],
  detail_points_fr = array['DELF DALF', 'TCF', 'TEF']::text[],
  detail_points_en = array['DELF DALF', 'TCF', 'TEF']::text[],
  detail_points_es = array['DELF DALF', 'TCF', 'TEF']::text[]
where slug = 'individuel-delf-dalf';

update public.course_offers
set
  requirements_fr = array['Documents techniques / spécialisés', 'Parcours unique créé pour l’étudiant', 'Accompagnement vers un objectif personnel ou professionnel personnalisé']::text[],
  requirements_en = array['Technical / specialised materials', 'A unique course created for the student', 'Personalised support towards a personal or professional goal']::text[],
  requirements_es = array['Documentos técnicos / especializados', 'Itinerario único creado para el estudiante', 'Acompañamiento personalizado hacia un objetivo personal o profesional']::text[],
  detail_points_fr = array['Parcours unique créé pour l’étudiant', 'Accompagnement vers un objectif personnel ou professionnel personnalisé']::text[],
  detail_points_en = array['A unique course created for the student', 'Personalised support towards a personal or professional goal']::text[],
  detail_points_es = array['Itinerario único creado para el estudiante', 'Acompañamiento personalizado hacia un objetivo personal o profesional']::text[]
where slug = 'individuel-professionnel';

update public.course_offers
set
  requirements_fr = array['Préparation aux examens', 'DELF A1 – A2 - B1']::text[],
  requirements_en = array['Exam preparation', 'DELF A1 – A2 - B1']::text[],
  requirements_es = array['Preparación para los exámenes', 'DELF A1 – A2 - B1']::text[],
  detail_points_fr = array['DELF A1 – A2 - B1']::text[],
  detail_points_en = array['DELF A1 – A2 - B1']::text[],
  detail_points_es = array['DELF A1 – A2 - B1']::text[]
where slug = 'groupe-delf-a1-a2-b1';

update public.course_offers
set
  requirements_fr = array['Préparation aux examens', 'DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[],
  requirements_en = array['Exam preparation', 'DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[],
  requirements_es = array['Preparación para los exámenes', 'DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[],
  detail_points_fr = array['DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[],
  detail_points_en = array['DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[],
  detail_points_es = array['DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[]
where slug = 'groupe-delf-b2-dalf-c1-c2';
