"use client";

import { useEffect, useState } from "react";

const themeStorageKey = "rendez-vous-theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

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
      aria-label={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
      title={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      onClick={toggleTheme}
      className="theme-toggle"
    >
      {isDark ? "Mode clair" : "Mode sombre"}
    </button>
  );
}