import Link from "next/link";
import AdminHeader from "../admin-header";
import OfferDashboard from "./offer-dashboard";

export default function OffersAdminPage() {
  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader />
        <section className="pb-20 pt-12 sm:pt-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Administration</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Offres</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">Créez, modifiez et retirez les offres affichées sur le site. Les inscriptions existantes restent conservées.</p>
          <div className="mt-8">
            <OfferDashboard />
          </div>
          <Link href="/admin" className="mt-8 inline-flex font-semibold text-red-700 underline decoration-red-300 underline-offset-4">Retour aux sections</Link>
        </section>
      </div>
    </main>
  );
}
