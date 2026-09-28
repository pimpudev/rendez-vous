"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

type Language = "fr" | "en" | "es";

const content = {
  fr: {
    nav: ["Accueil", "Présentation", "Programmes", "Avis", "Contact"],
    badge: "Formation de français • En ligne",
    title: "Cours de français en ligne",
    subtitle:
      "Cours de français en ligne individuels ou collectifs pour adultes, étudiants et professionnels.\nPour découvrir ou approfondir la langue française, choisissez Rendez-vous, la plateforme de français en ligne qui s’adapte à vos besoins.",
    primaryCta: "Réserver un cours",
    secondaryCta: "Découvrir la présentation",
    stats: [
      { value: "10+", label: "années d’expérience" },
      { value: "500+", label: "élèves accompagnés" },
      { value: "92%", label: "de satisfaction" },
    ],
    highlightsTitle: "Pourquoi choisir ma méthode ?",
    highlights: [
      {
        title: "Approche personnalisée",
        text: "Chaque cours est construit selon votre niveau, votre rythme et vos objectifs professionnels ou personnels.",
      },
      {
        title: "Conversation active",
        text: "Je mets l’accent sur la pratique orale pour vous rendre plus fluide et plus sûr(e) en français.",
      },
      {
        title: "Progression concrète",
        text: "Des objectifs clairs, des exercices ciblés et un suivi régulier pour maintenir votre motivation.",
      },
    ],
    programsTitle: "Programmes",
    programs: [
      { name: "A1/A2 – Débutant", text: "Apprendre les bases, prendre confiance et parler dès les premiers mois." },
      { name: "B1/B2 – Intermédiaire", text: "Améliorer votre fluidité, votre prononciation et votre expression spontanée." },
      { name: "C1/C2 – Avancé", text: "Mieux communiquer en français pour les entretiens, réunions et présentations." },
    ],
    testimonialsTitle: "Avis",
    testimonials: [
      "J’ai retrouvé confiance pour parler au travail. Les cours sont clairs, motivants et très bien structurés.",
      "La méthode m’a permis de progresser rapidement sans stress. Je pratique enfin le français naturellement.",
      "Très professionnelle, à l’écoute et exigeante dans le bon sens. J’ai vu une vraie progression en quelques mois.",
    ],
    ctaTitle: "Prêt(e) à faire passer votre français au niveau supérieur ?",
    ctaText: "Rendez votre objectif accessible avec un accompagnement humain et personnalisé.",
    ctaButton: "Prendre rendez-vous",
    footer: "© 2026 Rendez-vous • Formations linguistiques",
  },
  en: {
    nav: ["Home", "Presentation", "Programs", "Reviews", "Contact"],
    badge: "French training • Online",
    title: "Online French courses",
    subtitle:
      "Individual or group online French courses for adults, students, and professionals.\nTo discover or deepen the French language, choose Rendez-vous, the online French platform that adapts to your needs.",
    primaryCta: "Book a lesson",
    secondaryCta: "Discover the presentation",
    stats: [
      { value: "10+", label: "years of experience" },
      { value: "500+", label: "students guided" },
      { value: "92%", label: "satisfaction rate" },
    ],
    highlightsTitle: "Why choose my method?",
    highlights: [
      {
        title: "Personalized approach",
        text: "Each course is adapted to your level, pace, and personal or professional goals.",
      },
      {
        title: "Active speaking",
        text: "I prioritize oral communication so you become more fluent and confident in French.",
      },
      {
        title: "Real progress",
        text: "Clear objectives, targeted exercises, and consistent follow-up keep motivation high.",
      },
    ],
    programsTitle: "Programs",
    programs: [
      { name: "A1/A2 – Beginner", text: "Learn the basics, gain confidence, and start speaking from the first months." },
      { name: "B1/B2 – Intermediate", text: "Improve your fluency, pronunciation, and confidence in spontaneous discussion." },
      { name: "C1/C2 – Advanced", text: "Communicate more effectively in French for meetings, interviews, and presentations." },
    ],
    testimonialsTitle: "Reviews",
    testimonials: [
      "I regained confidence at work. The lessons are clear, motivating, and very well structured.",
      "The method helped me improve quickly without stress. I finally speak French naturally.",
      "Very professional, attentive, and demanding in the best way. I saw real progress in just a few months.",
    ],
    ctaTitle: "Ready to move your French to the next level?",
    ctaText: "Turn your goal into a clear plan with human, personalized support.",
    ctaButton: "Schedule a session",
    footer: "© 2026 Rendez-vous • Language training",
  },
  es: {
    nav: ["Inicio", "Presentación", "Programas", "Opiniones", "Contacto"],
    badge: "Formación de francés • En línea",
    title: "Cursos de francés en línea",
    subtitle:
      "Cursos de francés en línea individuales o grupales para adultos, estudiantes y profesionales.\nPara descubrir o perfeccionar el francés, elige Rendez-vous, la plataforma en línea que se adapta a tus necesidades.",
    primaryCta: "Reservar una clase",
    secondaryCta: "Descubrir la presentación",
    stats: [
      { value: "10+", label: "años de experiencia" },
      { value: "500+", label: "alumnos acompañados" },
      { value: "92%", label: "de satisfacción" },
    ],
    highlightsTitle: "¿Por qué elegir mi método?",
    highlights: [
      { title: "Enfoque personalizado", text: "Cada clase se adapta a tu nivel, ritmo y objetivos personales o profesionales." },
      { title: "Conversación activa", text: "Priorizo la práctica oral para que hables francés con más fluidez y confianza." },
      { title: "Progreso concreto", text: "Objetivos claros, ejercicios específicos y seguimiento regular para mantener tu motivación." },
    ],
    programsTitle: "Programas",
    programs: [
      { name: "A1/A2 – Principiante", text: "Aprende las bases, gana confianza y empieza a hablar desde los primeros meses." },
      { name: "B1/B2 – Intermedio", text: "Mejora tu fluidez, pronunciación y expresión espontánea." },
      { name: "C1/C2 – Avanzado", text: "Comunícate mejor en francés para entrevistas, reuniones y presentaciones." },
    ],
    testimonialsTitle: "Opiniones",
    testimonials: [
      "He recuperado la confianza para hablar en el trabajo. Las clases son claras, motivadoras y muy bien estructuradas.",
      "El método me permitió progresar rápidamente y sin estrés. Por fin practico francés de forma natural.",
      "Muy profesional, atenta y exigente en el buen sentido. Vi un progreso real en pocos meses.",
    ],
    ctaTitle: "¿Listo para llevar tu francés al siguiente nivel?",
    ctaText: "Haz que tu objetivo sea alcanzable con un acompañamiento humano y personalizado.",
    ctaButton: "Pedir una cita",
    footer: "© 2026 Rendez-vous • Formación lingüística",
  },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Language>("fr");
  const [programsOpen, setProgramsOpen] = useState(false);
  const t = content[lang];

  return (
    <div className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_35%,_#C9DDEA_68%,_#B6CCE1_100%)] text-slate-800">
      <header className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div className="relative flex items-center justify-end rounded-full bg-white px-4 py-3 shadow-sm">
          <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
            <ThemeToggle />
          </div>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 font-sans text-sm font-bold text-slate-900 md:flex">
            {t.nav.map((item) => (
              item === (lang === "fr" ? "Programmes" : lang === "en" ? "Programs" : "Programas") ? (
                <div key={item} className="relative">
                  <button
                    type="button"
                    aria-expanded={programsOpen}
                    onClick={() => setProgramsOpen((open) => !open)}
                    className="transition hover:text-red-600"
                  >
                    {item}
                  </button>
                  {programsOpen && (
                    <div className="absolute left-1/2 top-full z-20 mt-4 w-64 -translate-x-1/2 rounded-2xl bg-white p-2 text-left shadow-lg ring-1 ring-slate-200">
                      {t.programs.map((program, index) => (
                        <a
                          key={program.name}
                          href={`/programmes/${["a1-a2-debutant", "b1-b2-intermediaire", "c1-c2-avance"][index]}`}
                          onClick={() => setProgramsOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                        >
                          {program.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a key={item} href="#" className="transition hover:text-slate-900">
                  {item}
                </a>
              )
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
                <span className="mt-2 block">{t.title}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:text-left" style={{ whiteSpace: "pre-line" }}>
              {t.subtitle}
            </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-500">
                  {t.primaryCta}
                </button>
                <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                  {t.secondaryCta}
                </button>
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
              <div className="w-full max-w-[380px] overflow-hidden rounded-[1.5rem] border border-sky-200 bg-white/60 shadow-[0_20px_60px_rgba(14,64,97,0.08)]">
                <div className="relative aspect-video w-full bg-[linear-gradient(135deg,_#dfeef8_0%,_#cfe0ef_35%,_#b9d4eb_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.35),_transparent_55%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm">
                      <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[18px] border-y-transparent border-l-sky-700" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-full border border-white/60 bg-white/50 px-3 py-2 text-left backdrop-blur-sm">
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-sky-700">{t.nav[1]}</p>
                      <p className="text-[11px] font-medium text-slate-700">{t.secondaryCta}</p>
                    </div>
                    <span className="rounded-full bg-sky-700 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white">Video</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                {t.nav[1]}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {t.highlights.map((item) => (
                <article key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-lg font-bold text-red-700">
                    {item.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{t.programsTitle}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.programs.map((program, index) => (
              <Link
                id={`program-${index}`}
                key={program.name}
                href={`/programmes/${["a1-a2-debutant", "b1-b2-intermediaire", "c1-c2-avance"][index]}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md"
              >
                <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-700">
                  {program.name}
                </div>
                <p className="mt-4 text-lg leading-8 text-slate-600">{program.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.testimonialsTitle}</h2>
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-slate-500 lg:px-8">
          <p>{t.footer}</p>
          <p>bonjour@rendez-vous.fr</p>
        </div>
      </footer>
    </div>
  );
}
