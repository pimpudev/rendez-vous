import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "../../theme-toggle";

const offers = {
  "individuel-professionnel": {
    category: "INDIVIDUEL",
    name: "Professionnel – 1 à 4 compétences",
    price: "3000 roupies = 30 euros / heure",
    description:
      "Un accompagnement individuel adapté à vos objectifs professionnels. Choisissez de travailler de 1 à 4 compétences du français selon vos besoins.",
    limits: [],
  },
  "individuel-delf-dalf": {
    category: "INDIVIDUEL",
    name: "DELF DALF – 4 compétences",
    price: "2500 roupies = 25 euros / heure",
    description:
      "Préparez les examens DELF et DALF à votre rythme, avec un entraînement complet sur les quatre compétences évaluées.",
    limits: [],
  },
  "individuel-cours-libre": {
    category: "INDIVIDUEL",
    name: "Cours libre – 3 compétences",
    price: "2500 roupies = 25 euros / heure",
    description:
      "Un cours à la carte, construit autour de vos objectifs, de vos centres d’intérêt et des situations que vous souhaitez travailler.",
    limits: [],
  },
  "individuel-conversation": {
    category: "INDIVIDUEL",
    name: "Conversation – 2 compétences",
    price: "2000 roupies = 20 euros / heure",
    description:
      "Un cours individuel centré sur l’échange oral pour pratiquer le français, gagner en aisance et développer votre spontanéité.",
    limits: [],
  },
  "groupe-delf-a1-a2-b1": {
    category: "GROUPE",
    name: "DELF A1-A2-B1 – 4 compétences",
    price: "1000 roupies = 10 euros / heure / étudiant",
    description:
      "Une préparation aux examens DELF A1, A2 et B1 en petit groupe, avec un travail équilibré des quatre compétences.",
    limits: ["Minimum 4 étudiants / Maximum 10 étudiants", "Minimum 10 heures"],
  },
  "groupe-delf-b2-dalf-c1-c2": {
    category: "GROUPE",
    name: "DELF B2 - DALF C1-C2 – 4 compétences",
    price: "1500 roupies = 15 euros / heure / étudiant",
    description:
      "Une préparation aux examens DELF B2 et DALF C1-C2 en petit groupe, avec un travail approfondi des quatre compétences.",
    limits: ["Minimum 4 étudiants / Maximum 10 étudiants", "Minimum 10 heures"],
  },
  "groupe-cours-libre": {
    category: "GROUPE",
    name: "Cours libre – 3 compétences",
    price: "1000 roupies = 10 euros / heure / étudiant",
    description:
      "Un cours libre en petit groupe, construit autour des objectifs et des sujets choisis par les étudiants.",
    limits: ["Minimum 4 étudiants / Maximum 10 étudiants", "Minimum 10 heures"],
  },
  "groupe-conversation": {
    category: "GROUPE",
    name: "Conversation – 2 compétences",
    price: "800 roupies = 8 euros / heure / étudiant",
    description:
      "Un cours de conversation en petit groupe pour pratiquer le français, gagner en aisance et échanger dans une ambiance conviviale.",
    limits: ["Minimum 4 étudiants / Maximum 10 étudiants", "Minimum 10 heures"],
  },
} as const;

type OfferSlug = keyof typeof offers;

export function generateStaticParams() {
  return Object.keys(offers).map((slug) => ({ slug }));
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = offers[slug as OfferSlug];

  if (!offer) {
    notFound();
  }

  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-slate-900 transition hover:text-red-600">
              Rendez-Vous
            </Link>
            <ThemeToggle />
          </div>
          <Link href="/#programs" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
            Toutes les offres
          </Link>
        </header>

        <section className="mx-auto max-w-5xl px-2 pb-14 pt-16 text-center sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">{offer.category}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            OFFRE SPÉCIFIQUE
            <span className="mt-3 block text-3xl sm:text-5xl">{offer.name}</span>
          </h1>
        </section>

        <section className="mx-auto grid max-w-5xl items-center gap-10 pb-8 md:grid-cols-[1fr_0.78fr] md:gap-14">
          <div>
            <p className="text-lg leading-8 text-slate-600">{offer.description}</p>
            {offer.limits.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm font-semibold text-slate-700">
                {offer.limits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-lg font-bold text-slate-900">{offer.price}</p>
          </div>

          <div
            role="img"
            aria-label={`Vignette photo à venir pour l’offre ${offer.name}`}
            className="teacher-placeholder mx-auto flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl text-center shadow-md"
          >
            <span aria-hidden="true" className="teacher-placeholder-avatar">RV</span>
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">Photo à venir</span>
          </div>
        </section>

        <div className="pb-16 text-center">
          <Link
            href={`/formulaire?offre=${encodeURIComponent(offer.name)}&type=${offer.category === "INDIVIDUEL" ? "individual" : "group"}`}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 sm:text-lg"
          >
            Réserver ce cours
          </Link>
        </div>
      </div>
    </main>
  );
}