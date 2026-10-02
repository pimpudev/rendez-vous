import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import ReservationForm from "./reservation-flow";

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ offre?: string | string[]; type?: string | string[] }>;
}) {
  const { offre, type } = await searchParams;
  const selectedOffer = Array.isArray(offre) ? (offre[0] ?? "") : (offre ?? "");
  const offerTypeValue = Array.isArray(type) ? type[0] : type;
  const offerType = offerTypeValue === "group" ? "group" : "individual";

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
            Toutes les offres
          </Link>
        </header>

        <section className="mx-auto max-w-4xl px-2 pb-10 pt-14 text-center sm:pt-16">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Formulaire</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Vous êtes à quelques clics de prendre Rendez-Vous.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Pour réserver un cours, veuillez compléter ce formulaire. POUR CHAQUE QUESTION À CHOIX MULTIPLE, VOUS POUVEZ COCHER AUTANT D’OPTIONS QUE VOUS VOULEZ.
          </p>
        </section>

        <ReservationForm selectedOffer={selectedOffer} offerType={offerType} />
      </div>
    </main>
  );
}