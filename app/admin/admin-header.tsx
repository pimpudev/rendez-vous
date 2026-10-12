import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import { LanguageSelector } from "../site-language";

export default function AdminHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-white px-4 py-3 shadow-sm sm:px-5">
      <ThemeToggle />
      <div className="ml-auto flex items-center gap-2">
        <LanguageSelector />
        <Link href="/" className="text-sm font-semibold text-slate-700 transition hover:text-red-600">
          Retour au site
        </Link>
      </div>
    </header>
  );
}