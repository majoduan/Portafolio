import { createContext, useState, useEffect, useMemo } from 'react';

// Create context for app-wide state (language and theme)
export const AppContext = createContext();

// AppContext Provider Component
export const AppContextProvider = ({ children }) => {
  // Initialize language from localStorage or browser preference
  const getInitialLanguage = () => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      return savedLanguage;
    }
    
    // Fallback to browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) {
      return 'es';
    }
    
    // Default to English
    return 'en';
  };

  // Initialize theme from localStorage or default to dark
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }
    // Default to dark mode
    return 'dark';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

  // Persist language changes to localStorage
  useEffect(() => {
    localStorage.setItem('portfolio-language', language);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  // Persist theme changes to localStorage and update DOM
  useEffect(() => {
    localStorage.setItem('portfolio-theme', theme);
    // Update HTML class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toggle between English and Spanish
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Toggle between dark and light theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme
  }), [language, theme]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
