import Link from "next/link";
import AdminHeader from "../admin-header";
import OfferDashboard from "./offer-dashboard";

export default function OffersAdminPage() {
  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader />
        <section className="pb-20 pt-12 sm:pt-16">
          <h1 className="text-center text-3xl font-black tracking-tight sm:text-4xl"><span className="text-red-600">ADMIN</span><span className="text-red-600"> - Offres</span></h1>
          <div className="mt-8">
            <OfferDashboard />
          </div>
          <Link href="/admin" className="mt-8 inline-flex font-semibold text-red-700 underline decoration-red-300 underline-offset-4">Retour aux sections</Link>
        </section>
      </div>
    </main>
  );
}
