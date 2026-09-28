"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

type Language = "fr" | "en" | "es";

const content = {
  fr: {
    nav: ["Présentation", "Cours", "FAQ", "Avis", "Contact"],
    badge: "Formation de français • En ligne",
    subtitle: "Bienvenue sur notre plateforme de cours de français en ligne.\nDébutant ou expert, nous avons la formation qui correspond à vos objectifs.",
    primaryCta: "Réserver un cours",
    secondaryCta: "Découvrir la présentation",
    stats: [
      { value: "10+", label: "années d’expérience" },
      { value: "500+", label: "élèves accompagnés" },
      { value: "92%", label: "de satisfaction" },
    ],
    teacherName: "Benjamin Bruneau",
    teacherRole: "Directeur",
    teacherBio: [
      "Linguiste et pédagogue, Benjamin Bruneau a étudié la linguistique (Master 2 sciences du langage – Université Paris V) et la didactique du français langue étrangère (Master 2 Didactique du FLE – Université de Dijon).",
      "Depuis 2017, il a travaillé dans des Alliances françaises en France, en Inde et en Ukraine.",
      "Depuis 2026, il anime le podcast Voix-Liées.",
      "En 2027, il fonde la plateforme Rendez-Vous pour offrir un accompagnement plus personnalisé aux francophones du monde entier.",
    ],
    videoPlaceholder: "Vidéo de présentation",
    photoPlaceholder: "Photo du professeur",
    methodTitle: "Méthode",
    methodParagraphs: [
      "Rendez-Vous met à disposition de ses étudiants toutes les ressources nécessaires (pdf, audios, vidéos, manuels scolaires, films, etc).",
      "Les cours sont assurés via Zoom et les documents disponibles sur Drive.",
      "Afin de garantir un accompagnement personnalisé, les groupes ne dépassent jamais 10 étudiants.",
      "Bien que Rendez-Vous privilégie la communication interactive et les documents authentiques dans une ambiance conviviale, nous ajustons notre méthode à chaque étudiant, chaque groupe et chaque objectif.",
      "La meilleure méthode qui existe...est celle qui marche.",
    ],
    methodOfferStart: "Selon votre objectif, votre disponibilité et votre budget, choisissez ",
    methodOffer: "l’offre",
    methodOfferEnd: " qui vous correspond.",
    programsTitle: "Cours",
    offerBlocks: [
      {
        title: "INDIVIDUEL",
        notes: [],
        items: [
          { slug: "individuel-professionnel", name: "Professionnel – 1 à 4 compétences", price: "3000 roupies = 30 euros / heure" },
          { slug: "individuel-delf-dalf", name: "DELF DALF – 4 compétences", price: "2500 roupies = 25 euros / heure" },
          { slug: "individuel-cours-libre", name: "Cours libre – 3 compétences", price: "2500 roupies = 25 euros / heure" },
          { slug: "individuel-conversation", name: "Conversation – 2 compétences", price: "2000 roupies = 20 euros / heure" },
        ],
      },
      {
        title: "GROUPE",
        notes: ["Minimum 4 étudiants / Maximum 10 étudiants", "Minimum 10 heures"],
        items: [
          { slug: "groupe-delf-a1-a2-b1", name: "DELF A1-A2-B1 – 4 compétences", price: "1000 roupies = 10 euros / heure / étudiant" },
          { slug: "groupe-delf-b2-dalf-c1-c2", name: "DELF B2 - DALF C1-C2 – 4 compétences", price: "1500 roupies = 15 euros / heure / étudiant" },
          { slug: "groupe-cours-libre", name: "Cours libre – 3 compétences", price: "1000 roupies = 10 euros / heure / étudiant" },
          { slug: "groupe-conversation", name: "Conversation – 2 compétences", price: "800 roupies = 8 euros / heure / étudiant" },
        ],
      },
    ],
    testimonialsTitle: "Avis",
    testimonials: [
      "J’ai retrouvé confiance pour parler au travail. Les cours sont clairs, motivants et très bien structurés.",
      "La méthode m’a permis de progresser rapidement sans stress. Je pratique enfin le français naturellement.",
      "Très professionnelle, à l’écoute et exigeante dans le bon sens. J’ai vu une vraie progression en quelques mois.",
    ],
    faqTitle: "FAQ",
    faq: [
      { question: "À qui s’adressent les cours ?", answer: "Les cours s’adressent aux adultes, étudiants et professionnels, quel que soit votre niveau." },
      { question: "Les cours sont-ils individuels ?", answer: "Oui, les cours sont personnalisés pour respecter votre rythme et vos objectifs." },
      { question: "Comment réserver un cours ?", answer: "Écrivez-moi pour échanger sur votre besoin et choisir le format qui vous convient." },
    ],
    ctaTitle: "Prêt(e) à faire passer votre français au niveau supérieur ?",
    ctaText: "Rendez votre objectif accessible avec un accompagnement humain et personnalisé.",
    ctaButton: "Prendre rendez-vous",
    footer: "© 2026 Rendez-vous • Formations linguistiques",
  },
  en: {
    nav: ["Presentation", "Courses", "FAQ", "Reviews", "Contact"],
    badge: "French training • Online",
    subtitle:
      "Individual or group online French courses for adults, students, and professionals.\nTo discover or deepen the French language, choose Rendez-vous, the online French platform that adapts to your needs.",
    primaryCta: "Book a lesson",
    secondaryCta: "Discover the presentation",
    stats: [
      { value: "10+", label: "years of experience" },
      { value: "500+", label: "students guided" },
      { value: "92%", label: "satisfaction rate" },
    ],
    teacherName: "Benjamin Bruneau",
    teacherRole: "Director",
    teacherBio: [
      "A linguist and educator, Benjamin Bruneau studied linguistics (Master 2 in Language Sciences – Paris V University) and French as a Foreign Language teaching (Master 2 in FFL Didactics – University of Dijon).",
      "Since 2017, he has worked with Alliance Française locations in France, India, and Ukraine.",
      "Since 2026, he hosts the Voix-Liées podcast.",
      "In 2027, he will found the Rendez-Vous platform to offer more personalized support to French speakers around the world.",
    ],
    videoPlaceholder: "Presentation video",
    photoPlaceholder: "Teacher photo",
    methodTitle: "The method",
    methodParagraphs: [
      "Rendez-Vous provides students with all the resources they need (PDFs, audio, videos, textbooks, films, etc.).",
      "Lessons take place on Zoom, and materials are available on Drive.",
      "To ensure personalized support, groups never exceed 10 students.",
      "While Rendez-Vous favors interactive communication and authentic materials in a friendly atmosphere, we adapt our method to every student, group, and goal.",
      "The best method there is... is the one that works.",
    ],
    methodOfferStart: "Depending on your goals, availability, and budget, choose ",
    methodOffer: "the offer",
    methodOfferEnd: " that suits you.",
    programsTitle: "Courses",
    offerBlocks: [
      {
        title: "INDIVIDUAL",
        notes: [],
        items: [
          { slug: "individuel-professionnel", name: "Professional – 1 to 4 skills", price: "3,000 rupees = 30 euros / hour" },
          { slug: "individuel-delf-dalf", name: "DELF DALF – 4 skills", price: "2,500 rupees = 25 euros / hour" },
          { slug: "individuel-cours-libre", name: "Open course – 3 skills", price: "2,500 rupees = 25 euros / hour" },
          { slug: "individuel-conversation", name: "Conversation – 2 skills", price: "2,000 rupees = 20 euros / hour" },
        ],
      },
      {
        title: "GROUP",
        notes: ["Minimum 4 students / Maximum 10 students", "Minimum 10 hours"],
        items: [
          { slug: "groupe-delf-a1-a2-b1", name: "DELF A1-A2-B1 – 4 skills", price: "1,000 rupees = 10 euros / hour / student" },
          { slug: "groupe-delf-b2-dalf-c1-c2", name: "DELF B2 - DALF C1-C2 – 4 skills", price: "1,500 rupees = 15 euros / hour / student" },
          { slug: "groupe-cours-libre", name: "Open course – 3 skills", price: "1,000 rupees = 10 euros / hour / student" },
          { slug: "groupe-conversation", name: "Conversation – 2 skills", price: "800 rupees = 8 euros / hour / student" },
        ],
      },
    ],
    testimonialsTitle: "Reviews",
    testimonials: [
      "I regained confidence at work. The lessons are clear, motivating, and very well structured.",
      "The method helped me improve quickly without stress. I finally speak French naturally.",
      "Very professional, attentive, and demanding in the best way. I saw real progress in just a few months.",
    ],
    faqTitle: "FAQ",
    faq: [
      { question: "Who are the courses for?", answer: "The courses are for adults, students, and professionals at every level." },
      { question: "Are the courses individual?", answer: "Yes, each course is personalized to your pace and goals." },
      { question: "How do I book a lesson?", answer: "Send me a message to discuss your needs and choose the right format." },
    ],
    ctaTitle: "Ready to move your French to the next level?",
    ctaText: "Turn your goal into a clear plan with human, personalized support.",
    ctaButton: "Schedule a session",
    footer: "© 2026 Rendez-vous • Language training",
  },
  es: {
    nav: ["Presentación", "Cursos", "FAQ", "Opiniones", "Contacto"],
    badge: "Formación de francés • En línea",
    subtitle:
      "Cursos de francés en línea individuales o grupales para adultos, estudiantes y profesionales.\nPara descubrir o perfeccionar el francés, elige Rendez-vous, la plataforma en línea que se adapta a tus necesidades.",
    primaryCta: "Reservar una clase",
    secondaryCta: "Descubrir la presentación",
    stats: [
      { value: "10+", label: "años de experiencia" },
      { value: "500+", label: "alumnos acompañados" },
      { value: "92%", label: "de satisfacción" },
    ],
    teacherName: "Benjamin Bruneau",
    teacherRole: "Director",
    teacherBio: [
      "Lingüista y pedagogo, Benjamin Bruneau estudió lingüística (Máster 2 en Ciencias del Lenguaje – Universidad Paris V) y la enseñanza del francés como lengua extranjera (Máster 2 en Didáctica del FLE – Universidad de Dijon).",
      "Desde 2017, ha trabajado en sedes de la Alliance Française en Francia, India y Ucrania.",
      "Desde 2026, presenta el pódcast Voix-Liées.",
      "En 2027, fundará la plataforma Rendez-Vous para ofrecer un acompañamiento más personalizado a los francófonos de todo el mundo.",
    ],
    videoPlaceholder: "Vídeo de presentación",
    photoPlaceholder: "Foto del profesor",
    methodTitle: "El método",
    methodParagraphs: [
      "Rendez-Vous pone a disposición de sus estudiantes todos los recursos necesarios (PDF, audios, vídeos, manuales, películas, etc.).",
      "Las clases se imparten por Zoom y los documentos están disponibles en Drive.",
      "Para garantizar un acompañamiento personalizado, los grupos nunca superan los 10 estudiantes.",
      "Aunque Rendez-Vous prioriza la comunicación interactiva y los documentos auténticos en un ambiente agradable, adaptamos nuestro método a cada estudiante, grupo y objetivo.",
      "El mejor método que existe... es el que funciona.",
    ],
    methodOfferStart: "Según tus objetivos, disponibilidad y presupuesto, elige ",
    methodOffer: "la oferta",
    methodOfferEnd: " que mejor se adapte a ti.",
    programsTitle: "Cursos",
    offerBlocks: [
      {
        title: "INDIVIDUAL",
        notes: [],
        items: [
          { slug: "individuel-professionnel", name: "Profesional – 1 a 4 competencias", price: "3000 rupias = 30 euros / hora" },
          { slug: "individuel-delf-dalf", name: "DELF DALF – 4 competencias", price: "2500 rupias = 25 euros / hora" },
          { slug: "individuel-cours-libre", name: "Curso libre – 3 competencias", price: "2500 rupias = 25 euros / hora" },
          { slug: "individuel-conversation", name: "Conversación – 2 competencias", price: "2000 rupias = 20 euros / hora" },
        ],
      },
      {
        title: "GRUPO",
        notes: ["Mínimo 4 estudiantes / Máximo 10 estudiantes", "Mínimo 10 horas"],
        items: [
          { slug: "groupe-delf-a1-a2-b1", name: "DELF A1-A2-B1 – 4 competencias", price: "1000 rupias = 10 euros / hora / estudiante" },
          { slug: "groupe-delf-b2-dalf-c1-c2", name: "DELF B2 - DALF C1-C2 – 4 competencias", price: "1500 rupias = 15 euros / hora / estudiante" },
          { slug: "groupe-cours-libre", name: "Curso libre – 3 competencias", price: "1000 rupias = 10 euros / hora / estudiante" },
          { slug: "groupe-conversation", name: "Conversación – 2 competencias", price: "800 rupias = 8 euros / hora / estudiante" },
        ],
      },
    ],
    testimonialsTitle: "Opiniones",
    testimonials: [
      "He recuperado la confianza para hablar en el trabajo. Las clases son claras, motivadoras y muy bien estructuradas.",
      "El método me permitió progresar rápidamente y sin estrés. Por fin practico francés de forma natural.",
      "Muy profesional, atenta y exigente en el buen sentido. Vi un progreso real en pocos meses.",
    ],
    faqTitle: "FAQ",
    faq: [
      { question: "¿A quién van dirigidos los cursos?", answer: "Los cursos están dirigidos a adultos, estudiantes y profesionales de cualquier nivel." },
      { question: "¿Son clases individuales?", answer: "Sí, cada clase se personaliza según tu ritmo y tus objetivos." },
      { question: "¿Cómo reservar una clase?", answer: "Escríbeme para hablar de tus necesidades y elegir el formato adecuado." },
    ],
    ctaTitle: "¿Listo para llevar tu francés al siguiente nivel?",
    ctaText: "Haz que tu objetivo sea alcanzable con un acompañamiento humano y personalizado.",
    ctaButton: "Pedir una cita",
    footer: "© 2026 Rendez-vous • Formación lingüística",
  },
} as const;

function emphasizeProjectName(text: string) {
  return text.split(/(rendez-vous)/gi).map((part, index) =>
    /^rendez-vous$/i.test(part) ? <strong key={index}>{part}</strong> : part,
  );
}

function renderTeacherBio(text: string, teacherName: string) {
  const phrasesToItalicize = [
    teacherName,
    "Université Paris V",
    "Université de Dijon",
    "Paris V University",
    "University of Dijon",
    "Universidad Paris V",
    "Universidad de Dijon",
  ].filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));

  if (phrasesToItalicize.length === 0) return emphasizeProjectName(text);

  const escapeRegExp = (phrase: string) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const phrasePattern = new RegExp(`(${phrasesToItalicize.map(escapeRegExp).join("|")})`, "gi");

  return text.split(phrasePattern).map((part, index) =>
    phrasesToItalicize.some((phrase) => phrase.toLowerCase() === part.toLowerCase())
      ? <em key={index}>{part}</em>
      : emphasizeProjectName(part),
  );
}

export default function Home() {
  const [lang, setLang] = useState<Language>("fr");
  const t = content[lang];

  return (
    <div className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_35%,_#C9DDEA_68%,_#B6CCE1_100%)] text-slate-800">
      <header className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div className="relative flex items-center justify-end rounded-full bg-white px-4 py-3 shadow-sm">
          <div className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-3">
            <Link href="/" className="font-bold text-slate-900 transition hover:text-red-600">
              Rendez-vous
            </Link>
            <ThemeToggle language={lang} />
          </div>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 font-sans text-sm font-bold text-slate-900 md:flex">
            {t.nav.map((item) => (
              <a
                key={item}
                href={
                  item === t.nav[0]
                    ? "#presentation"
                    : item === t.programsTitle
                      ? "#programs"
                      : item === "FAQ"
                        ? "#faq"
                        : item === t.testimonialsTitle
                          ? "#reviews"
                          : "#contact"
                }
                className="transition hover:text-slate-900"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              {(["fr", "en", "es"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLang(option)}
                  aria-pressed={lang === option}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    lang === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 sm:inline-flex">
              {t.primaryCta}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                {t.badge}
              </span>
              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                <span className="block text-red-600">Rendez-vous</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:text-left" style={{ whiteSpace: "pre-line" }}>
                {emphasizeProjectName(t.subtitle)}
                {lang === "fr" && (
                  <>
                    <br />
                    Consultez les <Link href="#programs" className="font-bold text-red-600 underline decoration-red-300 underline-offset-4 hover:text-red-700">OFFRES</Link> pour en savoir plus.
                  </>
                )}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-500">
                  {t.primaryCta}
                </button>
                <Link href="#presentation" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                  {t.secondaryCta}
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {t.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="flex min-h-[280px] w-full max-w-[380px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center">
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-4xl font-black text-white shadow-lg shadow-red-200">R</span>
                    <span className="-ml-5 mt-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#EAF3F8] bg-slate-900 text-3xl font-black text-white">V</span>
                  </div>
                  <p className="mt-6 text-4xl font-black tracking-tight text-slate-900">Rendez-vous</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">{t.badge}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="presentation" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <section id="project">
              <div role="img" aria-label={t.videoPlaceholder} className="video-placeholder mx-auto flex aspect-video max-w-4xl flex-col items-center justify-center gap-4 rounded-2xl text-center text-white shadow-lg">
                <span aria-hidden="true" className="video-play-mark" />
                <span className="relative text-sm font-semibold uppercase tracking-[0.16em]">{t.videoPlaceholder}</span>
              </div>

              <div className="mt-6 grid items-center gap-8 border-t border-slate-200 pt-6 md:grid-cols-[1fr_0.72fr] md:gap-12">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">{t.teacherName}</h4>
                  <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-red-600">{t.teacherRole}</p>
                  <div className="mt-4 space-y-3 text-base leading-7 text-slate-600">
                    {t.teacherBio.map((paragraph) => (
                      <p key={paragraph}>{renderTeacherBio(paragraph, t.teacherName)}</p>
                    ))}
                  </div>
                </div>
                <div role="img" aria-label={t.photoPlaceholder} className="teacher-placeholder mx-auto flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl text-center shadow-md">
                  <span aria-hidden="true" className="teacher-placeholder-avatar">RV</span>
                  <span className="text-sm font-semibold uppercase tracking-[0.14em]">{t.photoPlaceholder}</span>
                </div>
              </div>
            </section>

            <section id="method" className="mt-16 border-t border-slate-200 pt-12">
              <h3 className="text-2xl font-bold text-slate-900">{t.methodTitle}</h3>
              <div className="mx-auto mt-8 grid max-w-none gap-x-12 gap-y-2 text-left md:grid-cols-2">
                {t.methodParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-slate-600">{emphasizeProjectName(paragraph)}</p>
                ))}
                <p className="text-base leading-7 text-slate-600">
                  {t.methodOfferStart}
                  {t.methodOffer}
                  {t.methodOfferEnd}
                </p>
              </div>
            </section>
          </div>
        </section>

        <section id="programs" className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{t.programsTitle}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {t.offerBlocks.map((block) => (
              <article key={block.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-center text-2xl font-black tracking-tight text-slate-900">{block.title}</h3>
                {block.notes.length > 0 && (
                  <div className="mt-3 space-y-1 text-center text-sm font-semibold text-red-600">
                    {block.notes.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                )}
                <ul className="mt-6 divide-y divide-slate-200">
                  {block.items.map((offer) => (
                    <li key={offer.slug}>
                      <Link href={`/offres/${offer.slug}`} className="group block rounded-md px-1 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                        <p className="font-semibold text-slate-900 transition-colors group-hover:text-red-600">{offer.name}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{offer.price}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{t.faqTitle}</h2>
            </div>

            <div className="mt-12 space-y-4">
              {t.faq.map((item) => (
                <details key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <summary className="cursor-pointer font-semibold text-slate-900">{item.question}</summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{t.testimonialsTitle}</h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {t.testimonials.map((quote) => (
                <blockquote key={quote} className="rounded-3xl border border-slate-700 bg-slate-800 p-6 text-base leading-7 text-slate-200">
                  “{quote}”
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-red-500 to-rose-600 p-[1px] shadow-[0_20px_60px_rgba(239,68,68,0.25)]">
            <div className="rounded-[calc(2rem-1px)] bg-white px-8 py-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t.ctaTitle}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">{t.ctaText}</p>
              <button className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t.ctaButton}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-slate-500 lg:px-8">
          <p>{emphasizeProjectName(t.footer)}</p>
          <p>bonjour@rendez-vous.fr</p>
        </div>
      </footer>
    </div>
  );
}
