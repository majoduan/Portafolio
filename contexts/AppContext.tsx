'use client';
import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setPrefs,
  type Language,
  type Theme,
} from '../lib/prefsStore';

export type { Language, Theme };

export interface AppContextValue {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  toggleTheme: () => void;
  /** True mientras hay un modal a pantalla completa abierto (oculta el navbar). */
  isModalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
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
  isModalOpen: false,
  setModalOpen: () => {},
};

export const AppContext = createContext<AppContextValue>(defaultContext);

interface AppContextProviderProps {
  children: ReactNode;
}

// Tema e idioma viven en lib/prefsStore (useSyncExternalStore): la página se
// hidrata con los valores del servidor ('en'/'dark') y se re-renderiza con los
// reales al terminar la hidratación, sin mismatch. El script inline del <head>
// ya aplicó `lang` y `.dark` al <html> antes del primer paint, así que no hay
// flash visual; la conmutación del texto ocurre debajo del boot overlay.
export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const setLanguage = useCallback((value: SetStateAction<Language>) => {
    const prev = getSnapshot().language;
    setPrefs({ language: typeof value === 'function' ? value(prev) : value });
  }, []);

  const setTheme = useCallback((value: SetStateAction<Theme>) => {
    const prev = getSnapshot().theme;
    setPrefs({ theme: typeof value === 'function' ? value(prev) : value });
  }, []);

  const toggleLanguage = useCallback(() => {
    setPrefs({ language: getSnapshot().language === 'en' ? 'es' : 'en' });
  }, []);

  // Toggle con polygon view-transition. flushSync garantiza que el snapshot
  // "new" de la View Transition capture el DOM ya conmutado.
  const toggleTheme = useCallback(() => {
    const next: Theme = getSnapshot().theme === 'dark' ? 'light' : 'dark';
    let reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    const apply = () => { flushSync(() => setPrefs({ theme: next })); };
    if (typeof document === 'undefined' || !document.startViewTransition || reduced) {
      apply();
      return;
    }
    // Señal para animaciones de fondo (partículas): pausar mientras dura el
    // wipe — la View Transition captura snapshots de página completa y un
    // canvas que cambia 60 veces/s debajo solo añade trabajo al compositor.
    const signal = (active: boolean) =>
      window.dispatchEvent(new CustomEvent('portfolio:theme-transition', { detail: { active } }));
    signal(true);
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => signal(false));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      language: prefs.language,
      setLanguage,
      toggleLanguage,
      theme: prefs.theme,
      setTheme,
      toggleTheme,
      isModalOpen,
      setModalOpen,
    }),
    [prefs.language, prefs.theme, setLanguage, setTheme, toggleLanguage, toggleTheme, isModalOpen]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
