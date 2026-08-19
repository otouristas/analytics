import { useAnalytics } from "@/lib/analytics/store";
import { useLayoutEffect } from "react";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.classList.toggle("light", theme === "light");
  window.localStorage.setItem("meridian-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "light" ? "#efece4" : "#070809",
  );
}

export function ThemeSync() {
  const theme = useAnalytics((s) => s.theme);
  const setTheme = useAnalytics((s) => s.setTheme);

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem("meridian-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, [setTheme]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}
