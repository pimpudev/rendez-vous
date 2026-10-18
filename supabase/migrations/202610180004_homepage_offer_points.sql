update public.course_offers
set requirements = array[
  'Conversation détendue',
  'Focus sur la prononciation et l’aisance orale'
]::text[]
where slug in ('individuel-conversation', 'groupe-conversation');

update public.course_offers
set requirements = array[
  'Documents authentiques',
  'Grammaire',
  'Sujets d’actualité',
  'Débat'
]::text[]
where slug in ('individuel-cours-libre', 'groupe-cours-libre');

update public.course_offers
set requirements = array[
  'Préparation aux examens',
  'DELF DALF',
  'TCF',
  'TEF'
]::text[]
where slug = 'individuel-delf-dalf';

update public.course_offers
set requirements = array[
  'Documents techniques / spécialisés',
  'Parcours unique créé pour l’étudiant',
  'Accompagnement vers un objectif personnel ou professionnel personnalisé'
]::text[]
where slug = 'individuel-professionnel';

update public.course_offers
set requirements = array[
  'Préparation aux examens',
  'DELF A1 – A2 - B1'
]::text[]
where slug = 'groupe-delf-a1-a2-b1';

update public.course_offers
set requirements = array[
  'Préparation aux examens',
  'DELF B2',
  'DALF C1 – C2',
  'TCF',
  'TEF'
]::text[]
where slug = 'groupe-delf-b2-dalf-c1-c2';
