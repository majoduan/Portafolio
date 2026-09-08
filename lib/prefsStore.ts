// Store externo de preferencias (tema + idioma) para useSyncExternalStore.
//
// Por qué: la página ahora se renderiza en el servidor DEBAJO del boot overlay
// (SEO/LCP reales). Leer localStorage dentro de useState durante el render
// inicial produce un mismatch de hidratación (server 'en'/'dark' vs cliente
// 'es'/'light'). Con useSyncExternalStore React hidrata con getServerSnapshot
// y re-renderiza con getSnapshot en cuanto termina: sin mismatch, sin flash
// (el script inline del <head> ya aplicó lang y .dark antes del primer paint).

export type Language = 'en' | 'es';
export type Theme = 'dark' | 'light';
export interface Prefs { theme: Theme; language: Language }

const SERVER_PREFS: Prefs = { theme: 'dark', language: 'en' };

let prefs: Prefs = SERVER_PREFS;
let hydrated = false;
const listeners = new Set<() => void>();

function readInitial(): Prefs {
  let savedLang: string | null = null;
  let savedTheme: string | null = null;
  try {
    savedLang = localStorage.getItem('portfolio-language');
    savedTheme = localStorage.getItem('portfolio-theme');
  } catch { /* storage bloqueado */ }

  const language: Language =
    savedLang === 'en' || savedLang === 'es'
      ? savedLang
      : navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';

  let theme: Theme;
  if (savedTheme === 'dark' || savedTheme === 'light') theme = savedTheme;
  else {
    let light = false;
    try { light = window.matchMedia('(prefers-color-scheme: light)').matches; } catch { /* ignore */ }
    theme = light ? 'light' : 'dark';
  }
  return { theme, language };
}

export function getSnapshot(): Prefs {
  if (!hydrated) {
    prefs = readInitial();
    hydrated = true;
  }
  return prefs;
}

export function getServerSnapshot(): Prefs {
  return SERVER_PREFS;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function persist(next: Prefs): void {
  try {
    localStorage.setItem('portfolio-language', next.language);
    localStorage.setItem('portfolio-theme', next.theme);
  } catch { /* ignore */ }
  document.documentElement.lang = next.language;
  document.documentElement.classList.toggle('dark', next.theme === 'dark');
}

export function setPrefs(partial: Partial<Prefs>): void {
  const current = getSnapshot();
  const next: Prefs = { ...current, ...partial };
  if (next.theme === current.theme && next.language === current.language) return;
  prefs = next;
  persist(next);
  listeners.forEach((l) => l());
}
