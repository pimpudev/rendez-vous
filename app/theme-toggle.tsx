"use client";

import { useEffect, useState } from "react";

const themeStorageKey = "rendez-vous-theme";

const labels = {
  fr: {
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    activateDark: "Activer le mode sombre",
    activateLight: "Activer le mode clair",
  },
  en: {
    darkMode: "Dark mode",
    lightMode: "Light mode",
    activateDark: "Activate dark mode",
    activateLight: "Activate light mode",
  },
  es: {
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    activateDark: "Activar el modo oscuro",
    activateLight: "Activar el modo claro",
  },
} as const;

export default function ThemeToggle({ language = "fr" }: { language?: keyof typeof labels }) {
  const [isDark, setIsDark] = useState(false);
  const text = labels[language];

  useEffect(() => {
    let savedTheme = "light";

    try {
      savedTheme = localStorage.getItem(themeStorageKey) ?? "light";
    } catch {}

    const dark = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  function toggleTheme() {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);

    try {
      localStorage.setItem(themeStorageKey, nextIsDark ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? text.lightMode : text.darkMode}
      title={isDark ? text.activateLight : text.activateDark}
      onClick={toggleTheme}
      className="theme-toggle"
    >
      <span className="theme-toggle-thumb" />
    </button>
  );
}