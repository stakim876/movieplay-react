import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

const THEME_KEY = "mp_theme_v1";
type ThemeMode = "light" | "dark" | "system";

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && ["light", "dark", "system"].includes(saved)) {
      return saved as ThemeMode;
    }
  } catch (err) {
    console.error("테마 로드 실패:", err);
  }
  return "system";
}

function getEffectiveTheme(theme: ThemeMode) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(effectiveTheme: string) {
  document.documentElement.setAttribute("data-theme", effectiveTheme);
}

interface ThemeState {
  theme: ThemeMode;
  effectiveTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (newTheme: ThemeMode) => void;
}

const initialTheme = loadTheme();
const initialEffective = getEffectiveTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  effectiveTheme: initialEffective,

  toggleTheme: () => {
    set((state) => {
      const next =
        state.theme === "dark" ? "light" : state.theme === "light" ? "system" : "dark";
      const effectiveTheme = getEffectiveTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        console.error("테마 저장 실패:", err);
      }
      applyTheme(effectiveTheme);
      return { theme: next, effectiveTheme };
    });
  },

  setTheme: (newTheme) => {
    if (!["light", "dark", "system"].includes(newTheme)) return;
    const effectiveTheme = getEffectiveTheme(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (err) {
      console.error("테마 저장 실패:", err);
    }
    applyTheme(effectiveTheme);
    set({ theme: newTheme, effectiveTheme });
  },
}));

let mediaCleanup: (() => void) | null = null;

export function initThemeStore() {
  applyTheme(initialEffective);

  if (mediaCleanup) return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    const { theme } = useThemeStore.getState();
    if (theme !== "system") return;
    const effectiveTheme = getEffectiveTheme("system");
    applyTheme(effectiveTheme);
    useThemeStore.setState({ effectiveTheme });
  };

  mediaQuery.addEventListener("change", handleChange);
  mediaCleanup = () => mediaQuery.removeEventListener("change", handleChange);
}

export function useTheme() {
  return useThemeStore(
    useShallow((s) => ({
      theme: s.theme,
      effectiveTheme: s.effectiveTheme,
      toggleTheme: s.toggleTheme,
      setTheme: s.setTheme,
    }))
  );
}
