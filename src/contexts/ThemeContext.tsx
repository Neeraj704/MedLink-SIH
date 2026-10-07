import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

const THEME_KEY = "medlink:theme";

type ThemeValue = {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeValue>({
  isDark: false,
  toggle: () => {},
  setDark: () => {},
});

function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    localStorage.setItem("medlink-theme", dark ? "dark" : "light");
  } catch {
    /* storage unavailable */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem("medlink-theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const setDark = useCallback((dark: boolean) => {
    setIsDarkState(dark);
  }, []);

  const toggle = useCallback(() => {
    setIsDarkState((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isDark, toggle, setDark }), [isDark, toggle, setDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_KEY}')||localStorage.getItem('medlink-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',d);r.classList.toggle('light',!d);}catch(e){}})();`;
