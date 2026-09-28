import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "../../theme-toggle";

const programs = {
  "a1-a2-debutant": {
    name: "A1/A2 – Débutant",
    eyebrow: "Premiers échanges",
    description: "Apprendre les bases, prendre confiance et parler dès les premiers mois.",
    details:
      "Ce parcours vous aide à construire des bases solides en français et à communiquer dans les situations du quotidien, avec des cours progressifs et concrets.",
    audience: "Pour commencer le français ou reprendre les fondamentaux avec confiance.",
    outcomes: ["Se présenter et échanger dans les situations courantes", "Comprendre les expressions essentielles", "Construire des phrases simples avec assurance"],
  },
  "b1-b2-intermediaire": {
    name: "B1/B2 – Intermédiaire",
    eyebrow: "Expression et fluidité",
    description: "Améliorer votre fluidité, votre prononciation et votre expression spontanée.",
    details:
      "Ce parcours vous permet de développer votre aisance à l'oral et à l'écrit, tout en enrichissant votre vocabulaire pour les échanges personnels et professionnels.",
    audience: "Pour consolider vos acquis et vous exprimer plus naturellement en français.",
    outcomes: ["Participer à des conversations avec plus de spontanéité", "Structurer vos idées à l'oral et à l'écrit", "Gagner en précision et en confiance"],
  },
  "c1-c2-avance": {
    name: "C1/C2 – Avancé",
    eyebrow: "Précision et impact",
    description: "Mieux communiquer en français pour les entretiens, réunions et présentations.",
    details:
      "Ce parcours vous accompagne vers une expression précise, nuancée et adaptée aux contextes professionnels ou académiques exigeants.",
    audience: "Pour perfectionner votre français et affirmer votre voix dans les situations complexes.",
    outcomes: ["Nuancer votre expression et adapter votre registre", "Argumenter avec précision lors d'échanges exigeants", "Préparer des entretiens, réunions et présentations"],
  },
} as const;

type ProgramSlug = keyof typeof programs;

export function generateStaticParams() {
  return Object.keys(programs).map((slug) => ({ slug }));
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = programs[slug as ProgramSlug];

  if (!program) {
    notFound();
  }

  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-slate-900 transition hover:text-red-600">
              Rendez-vous
            </Link>
            <ThemeToggle />
          </div>
          <Link href="/#programs" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
            Tous les programmes
          </Link>
        </header>

        <section className="mx-auto max-w-4xl px-2 pb-20 pt-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">{program.eyebrow}</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">{program.name}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-slate-600">{program.description}</p>
        </section>

        <section className="grid gap-6 pb-20 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-black text-slate-900">Le parcours</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{program.details}</p>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900">Pour qui ?</h3>
              <p className="mt-2 leading-7 text-slate-600">{program.audience}</p>
            </div>
          </article>

          <article className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm sm:p-10">
            <h2 className="text-2xl font-black">Vous allez pouvoir</h2>
            <ul className="mt-6 space-y-4 text-slate-200">
              {program.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 leading-7">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
            <Link href="/#contact" className="mt-8 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-500">
              Prendre rendez-vous
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
