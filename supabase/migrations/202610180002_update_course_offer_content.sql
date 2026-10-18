update public.course_offers
set
  name_fr = 'BlaBlaBla',
  name_en = 'BlaBlaBla',
  name_es = 'BlaBlaBla',
  description_fr = 'Conversation détendue',
  description_en = 'Relaxed conversation',
  description_es = 'Conversación relajada',
  price_inr = 2000,
  price_eur = 20,
  requirements = array['Focus sur la prononciation et l’aisance orale']::text[]
where slug = 'individuel-conversation';

update public.course_offers
set
  name_fr = 'C’est la vie',
  name_en = 'C’est la vie',
  name_es = 'C’est la vie',
  description_fr = 'Documents authentiques',
  description_en = 'Authentic materials',
  description_es = 'Documentos auténticos',
  price_inr = 2500,
  price_eur = 25,
  requirements = array['Grammaire', 'Sujets d’actualité', 'Débat']::text[]
where slug = 'individuel-cours-libre';

update public.course_offers
set
  name_fr = 'Académique',
  name_en = 'Academic',
  name_es = 'Académico',
  description_fr = 'Préparation aux examens',
  description_en = 'Exam preparation',
  description_es = 'Preparación para los exámenes',
  price_inr = 2500,
  price_eur = 25,
  requirements = array['DELF DALF', 'TCF', 'TEF']::text[]
where slug = 'individuel-delf-dalf';

update public.course_offers
set
  name_fr = 'Sur Mesure',
  name_en = 'Tailor-made',
  name_es = 'A medida',
  description_fr = 'Documents techniques / spécialisés',
  description_en = 'Technical / specialised materials',
  description_es = 'Documentos técnicos / especializados',
  price_inr = 3000,
  price_eur = 30,
  requirements = array['Parcours unique créé pour l’étudiant', 'Accompagnement vers un objectif personnel ou professionnel personnalisé']::text[]
where slug = 'individuel-professionnel';

update public.course_offers
set
  name_fr = 'BlaBlaBla',
  name_en = 'BlaBlaBla',
  name_es = 'BlaBlaBla',
  description_fr = 'Conversation détendue',
  description_en = 'Relaxed conversation',
  description_es = 'Conversación relajada',
  price_inr = 500,
  price_eur = 5,
  requirements = array['Focus sur la prononciation et l’aisance orale']::text[]
where slug = 'groupe-conversation';

update public.course_offers
set
  name_fr = 'C’est la vie',
  name_en = 'C’est la vie',
  name_es = 'C’est la vie',
  description_fr = 'Documents authentiques',
  description_en = 'Authentic materials',
  description_es = 'Documentos auténticos',
  price_inr = 1000,
  price_eur = 10,
  requirements = array['Grammaire', 'Sujets d’actualité', 'Débat']::text[]
where slug = 'groupe-cours-libre';

update public.course_offers
set
  name_fr = 'Académique',
  name_en = 'Academic',
  name_es = 'Académico',
  description_fr = 'Préparation aux examens',
  description_en = 'Exam preparation',
  description_es = 'Preparación para los exámenes',
  price_inr = 1000,
  price_eur = 10,
  requirements = array['DELF A1 – A2 - B1']::text[]
where slug = 'groupe-delf-a1-a2-b1';

update public.course_offers
set
  name_fr = 'Académique Avancé',
  name_en = 'Advanced Academic',
  name_es = 'Académico avanzado',
  description_fr = 'Préparation aux examens',
  description_en = 'Exam preparation',
  description_es = 'Preparación para los exámenes',
  price_inr = 1500,
  price_eur = 15,
  requirements = array['DELF B2', 'DALF C1 – C2', 'TCF', 'TEF']::text[]
where slug = 'groupe-delf-b2-dalf-c1-c2';
