import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import { LanguageSelector } from "./site-language";

export default function SiteHeader({ showLanguageSelector = true }: { showLanguageSelector?: boolean }) {
  return (
    <header className="mx-auto max-w-6xl px-3 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 rounded-full bg-white px-2 py-3 shadow-sm sm:px-4">
        <div className="col-start-1 row-start-1 justify-self-start">
          <ThemeToggle />
        </div>
        <Link
          href="/"
          aria-label="Rendez-Vous, accueil"
          className="col-start-2 row-start-1 justify-self-center whitespace-nowrap text-xl font-black text-slate-900 transition hover:text-red-600 sm:text-3xl"
        >
          Rendez-Vous
        </Link>
        {showLanguageSelector && (
          <div className="col-start-3 row-start-1 justify-self-end">
            <LanguageSelector />
          </div>
        )}
      </div>
    </header>
  );
}
