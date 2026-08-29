"use client";

import { useState } from "react";

type Language = "fr" | "en";

const content = {
  fr: {
    nav: ["Accueil", "Méthode", "Programmes", "Témoignages", "Contact"],
    badge: "Professeur de français • Paris & en ligne",
    title: "Parlez français avec confiance et naturel.",
    subtitle:
      "Cours personnalisés pour adultes, étudiants et professionnels. J’aide mes élèves à progresser avec une méthode claire, motivante et adaptée à leurs objectifs.",
    primaryCta: "Réserver un cours",
    secondaryCta: "Découvrir la méthode",
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
    programsTitle: "Des programmes pour chaque objectif",
    programs: [
      { name: "Débutants", text: "Apprendre les bases, prendre confiance et parler dès les premiers mois." },
      { name: "Conversation", text: "Améliorer votre fluidité, votre prononciation et votre expression spontanée." },
      { name: "Professionnel", text: "Mieux communiquer en français pour les entretiens, réunions et présentations." },
    ],
    testimonialsTitle: "Ce que disent mes élèves",
    testimonials: [
      "J’ai retrouvé confiance pour parler au travail. Les cours sont clairs, motivants et très bien structurés.",
      "La méthode m’a permis de progresser rapidement sans stress. Je pratique enfin le français naturellement.",
      "Très professionnelle, à l’écoute et exigeante dans le bon sens. J’ai vu une vraie progression en quelques mois.",
    ],
    ctaTitle: "Prêt(e) à faire passer votre français au niveau supérieur ?",
    ctaText: "Rendez votre objectif accessible avec un accompagnement humain et personnalisé.",
    ctaButton: "Prendre rendez-vous",
    footer: "© 2026 Françoise Martin • Professeur de français",
  },
  en: {
    nav: ["Home", "Method", "Programs", "Testimonials", "Contact"],
    badge: "French teacher • Paris & online",
    title: "Speak French with ease and confidence.",
    subtitle:
      "Tailored lessons for adults, students, and professionals. I help learners make progress with a clear, motivating, and personalized method.",
    primaryCta: "Book a lesson",
    secondaryCta: "Discover the method",
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
    programsTitle: "Programs for every goal",
    programs: [
      { name: "Beginners", text: "Learn the basics, gain confidence, and start speaking from the first months." },
      { name: "Conversation", text: "Improve your fluency, pronunciation, and confidence in spontaneous discussion." },
      { name: "Professional", text: "Communicate more effectively in French for meetings, interviews, and presentations." },
    ],
    testimonialsTitle: "What my students say",
    testimonials: [
      "I regained confidence at work. The lessons are clear, motivating, and very well structured.",
      "The method helped me improve quickly without stress. I finally speak French naturally.",
      "Very professional, attentive, and demanding in the best way. I saw real progress in just a few months.",
    ],
    ctaTitle: "Ready to move your French to the next level?",
    ctaText: "Turn your goal into a clear plan with human, personalized support.",
    ctaButton: "Schedule a session",
    footer: "© 2026 Françoise Martin • French Teacher",
  },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Language>("fr");
  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
              F
            </div>
            <div>
              <p className="text-lg font-semibold">Françoise Martin</p>
              <p className="text-xs text-slate-500">French Coach</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            {t.nav.map((item) => (
              <a key={item} href="#" className="transition hover:text-slate-900">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              {(["fr", "en"] as const).map((option) => (
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
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                {t.badge}
              </span>
              <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{t.subtitle}</p>

              <div className="mt-8 flex flex-wrap gap-4">
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

            <div className="relative">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-red-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Progress</p>
                      <p className="mt-2 text-3xl font-bold">B1 → B2</p>
                    </div>
                    <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
                      12 weeks
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm text-slate-200">
                        <span>Speaking</span>
                        <span>82%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[82%] rounded-full bg-red-300" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm text-slate-200">
                        <span>Listening</span>
                        <span>88%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[88%] rounded-full bg-amber-300" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm text-slate-200">
                        <span>Grammar</span>
                        <span>76%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-[76%] rounded-full bg-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Next session</span>
                    <span className="font-medium text-slate-900">Thursday 18:30</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Conversation orale</p>
                      <p className="text-sm text-slate-500">45 min • en ligne</p>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Confirmé
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">{t.highlightsTitle}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t.highlightsTitle}
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

        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">Programs</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t.programsTitle}</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.programs.map((program) => (
              <div key={program.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-700">
                  {program.name}
                </div>
                <p className="mt-4 text-lg leading-8 text-slate-600">{program.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">{t.testimonialsTitle}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t.testimonialsTitle}</h2>
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
          <p>bonjour@francoisemartin.fr</p>
        </div>
      </footer>
    </div>
  );
}
