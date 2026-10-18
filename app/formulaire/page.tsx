import SiteHeader from "../site-header";
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
        <SiteHeader />

        <section className="mx-auto max-w-4xl px-2 pb-10 pt-14 text-center sm:pt-16">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            {selectedOffer || (offerType === "individual" ? "Cours individuel" : "Cours groupe")}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Vous êtes juste à quelques clics de prendre Rendez-Vous.
          </p>
        </section>

        <ReservationForm selectedOffer={selectedOffer} offerType={offerType} />
      </div>
    </main>
  );
}