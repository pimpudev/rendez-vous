import Link from "next/link";
import ThemeToggle from "../theme-toggle";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
      <ThemeToggle />
      <Link href="/" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
        Retour au site
      </Link>
    </header>
  );
}