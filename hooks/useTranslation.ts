'use client';
import { useContext, useMemo } from 'react';
import { AppContext, type Language } from '../contexts/AppContext';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

// El árbol de traducciones es recursivo: cada nodo es un objeto, string o array.
type TranslationNode = string | string[] | TranslationTree;
interface TranslationTree {
  [key: string]: TranslationNode;
}

// Translation files map
const translations: Record<Language, TranslationTree> = {
  en: enTranslations as TranslationTree,
  es: esTranslations as TranslationTree,
};

// Tipo del valor que devuelve `t()`. Puede ser string (caso normal),
// string[] (listas como bullets), o el key como fallback si no encuentra.
export type TranslationResult = string | string[] | TranslationTree;
export type TranslationFunction = (key: string) => TranslationResult;

/**
 * Custom hook for accessing translations.
 * Returns the translation function and current language.
 */
export const useTranslation = (): { t: TranslationFunction; language: Language } => {
  const { language } = useContext(AppContext);

  // Memoize the translation function to prevent re-creation on every render
  const t = useMemo<TranslationFunction>(() => {
    return (key: string): TranslationResult => {
      const keys = key.split('.');
      let result: TranslationNode = translations[language];

      for (const k of keys) {
        if (result && typeof result === 'object' && !Array.isArray(result) && k in result) {
          result = result[k];
        } else {
          // Translation key not found, returning key
          return key;
        }
      }

      return result;
    };
  }, [language]);

  return { t, language };
};
