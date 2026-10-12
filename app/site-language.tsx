"use client";

import { useEffect, useSyncExternalStore } from "react";

export type SiteLanguage = "fr" | "en" | "es";

const languageStorageKey = "rendez-vous-language";
const listeners = new Set<() => void>();

const languageOptions: Record<SiteLanguage, { label: string }> = {
  fr: { label: "Français" },
  en: { label: "English" },
  es: { label: "Español" },
};

function readLanguage(): SiteLanguage {
  try {
    const storedLanguage = localStorage.getItem(languageStorageKey);
    if (storedLanguage === "fr" || storedLanguage === "en" || storedLanguage === "es") {
      return storedLanguage;
    }
  } catch {}

  return "fr";
}

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  listeners.add(listener);
  const handleStorage = () => listener();
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getLanguageSnapshot() {
  return typeof window === "undefined" ? "fr" : readLanguage();
}

function getServerLanguageSnapshot(): SiteLanguage {
  return "fr";
}

export function useSiteLanguage(): SiteLanguage {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerLanguageSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return language;
}

function setSiteLanguage(language: SiteLanguage) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {}

  if (typeof document !== "undefined") document.documentElement.lang = language;
  listeners.forEach((listener) => listener());
}

export function LanguageSelector() {
  const language = useSiteLanguage();

  return (
    <div className="inline-flex min-w-0 justify-self-end rounded-full border border-slate-200 bg-slate-100 p-1">
      {(Object.keys(languageOptions) as SiteLanguage[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setSiteLanguage(option)}
          aria-pressed={language === option}
          aria-label={languageOptions[option].label}
          title={languageOptions[option].label}
          className={`inline-flex h-7 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold transition sm:h-8 sm:px-2.5 sm:text-xs ${
            language === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
