import Link from "next/link";
import AdminHeader from "./admin-header";

const adminSections = [
  { name: "Étudiants", href: "/admin/etudiants", detail: "Inscriptions, cours et statuts" },
  { name: "Groupes", href: "/admin/groupes", detail: "Groupes de cours ouverts" },
  { name: "Planning", href: "/admin/planning", detail: "Créneaux et disponibilités" },
];

export default function AdminPage() {
  return (
    <main className="site-shell min-h-screen bg-[linear-gradient(180deg,_#EAF3F8_0%,_#DDECF5_45%,_#C9DDEA_100%)] px-6 py-8 text-slate-800 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader />
        <section className="mx-auto max-w-5xl pb-20 pt-16 sm:pt-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Administration</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Gestion des inscriptions</h1>
          <nav aria-label="Sections d’administration" className="mt-10 grid gap-5 md:grid-cols-3">
            {adminSections.map((section) => (
              <Link key={section.href} href={section.href} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md">
                <span className="text-xl font-bold text-slate-900">{section.name}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">{section.detail}</span>
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}