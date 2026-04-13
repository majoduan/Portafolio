'use client';
import { createContext, useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';

// Create context for app-wide state (language and theme)
export const AppContext = createContext();

// AppContext Provider Component
export const AppContextProvider = ({ children }) => {
  // Initialize language from localStorage or browser preference
  const getInitialLanguage = () => {
    if (typeof window === 'undefined') return 'en';
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
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      return savedTheme;
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

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
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Apply theme synchronously so the View Transitions snapshot captures the new state
  const applyTheme = (next) => {
    flushSync(() => setTheme(next));
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // Toggle between dark and light theme with polygon view-transition
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const reduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof document === 'undefined' || !document.startViewTransition || reduced) {
      applyTheme(next);
      return;
    }
    document.startViewTransition(() => applyTheme(next));
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
