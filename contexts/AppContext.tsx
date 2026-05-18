'use client';
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';

export type Language = 'en' | 'es';
export type Theme = 'dark' | 'light';

export interface AppContextValue {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  toggleTheme: () => void;
}

// Default value matches the shape for SSR — el real Provider monta el state
// y reemplaza estos no-ops.
const defaultContext: AppContextValue = {
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
};

// Create context for app-wide state (language and theme)
export const AppContext = createContext<AppContextValue>(defaultContext);

interface AppContextProviderProps {
  children: ReactNode;
}

// AppContext Provider Component
export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  // Initialize language from localStorage or browser preference
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en';
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage === 'en' || savedLanguage === 'es') {
      return savedLanguage;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      return 'es';
    }
    return 'en';
  };

  // Initialize theme from localStorage or default to dark
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Persist language changes to localStorage
  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  // Persist theme changes to localStorage (DOM class is handled imperatively in toggleTheme)
  useEffect(() => {
    localStorage.setItem('portfolio-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Toggle between English and Spanish
  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  }, []);

  // Apply theme synchronously so the View Transitions snapshot captures the new state
  const applyTheme = useCallback((next: Theme) => {
    flushSync(() => setTheme(next));
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, []);

  // Toggle between dark and light theme with polygon view-transition
  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof document === 'undefined' || !document.startViewTransition || reduced) {
      applyTheme(next);
      return;
    }
    document.startViewTransition(() => applyTheme(next));
  }, [theme, applyTheme]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AppContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      theme,
      setTheme,
      toggleTheme,
    }),
    [language, theme, toggleLanguage, toggleTheme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
