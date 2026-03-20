'use client';
import React, { memo, useContext } from 'react';
import { Languages } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

/**
 * LanguageToggle Component
 * Renders a button to switch between English and Spanish
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const LanguageToggle = memo(() => {
  const { language, toggleLanguage } = useContext(AppContext);

  return (
    <button
      onClick={toggleLanguage}
      className="w-10 h-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-black dark:hover:bg-white group/toggle"
      aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      title={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
    >
      <span className="text-sm font-bold text-black dark:text-white group-hover/toggle:text-white dark:group-hover/toggle:text-black transition-colors duration-300">
        {language === 'en' ? 'EN' : 'ES'}
      </span>
    </button>
  );
});

LanguageToggle.displayName = 'LanguageToggle';

export default LanguageToggle;
