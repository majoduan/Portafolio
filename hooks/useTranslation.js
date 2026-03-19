import { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

// Translation files map
const translations = {
  en: enTranslations,
  es: esTranslations
};

/**
 * Custom hook for accessing translations
 * Returns the translation function and current language
 */
export const useTranslation = () => {
  const { language } = useContext(AppContext);

  // Memoize the translation function to prevent re-creation on every render
  const t = useMemo(() => {
    /**
     * Translation function that supports nested keys
     * @param {string} key - Translation key in dot notation (e.g., 'nav.home')
     * @returns {string} Translated text or the key itself if not found
     */
    return (key) => {
      const keys = key.split('.');
      let result = translations[language];
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Translation key not found, returning key
          return key; // Return key if translation not found
        }
      }
      
      return result;
    };
  }, [language]);

  return { t, language };
};
