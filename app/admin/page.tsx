import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import AdminDashboard from "./admin-dashboard";

export default function AdminPage() {
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
          <Link href="/" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
            Retour au site
          </Link>
        </header>

        <AdminDashboard />
      </div>
    </main>
  );
}