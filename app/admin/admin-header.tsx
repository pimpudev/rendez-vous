import Link from "next/link";
import ThemeToggle from "../theme-toggle";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="font-bold text-slate-900 transition hover:text-red-600">
          Rendez-vous · Admin
        </Link>
        <ThemeToggle />
      </div>
      <Link href="/" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
        Retour au site
      </Link>
    </header>
  );
}