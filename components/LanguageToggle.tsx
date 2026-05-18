'use client';
import React, { memo, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

/**
 * LanguageToggle — sin burbuja.
 * Default: texto EN/ES solido en color del tema.
 * Hover: scale(1.1) feedback (sin cambio de color/contorno).
 */
const LanguageToggle = memo(() => {
  const { language, toggleLanguage } = useContext(AppContext);

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center justify-center w-11 h-11 text-black dark:text-white transition-colors duration-300 group/toggle"
      aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      title={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
    >
      <span className="text-sm font-bold nav-toggle-text">
        {language === 'en' ? 'EN' : 'ES'}
      </span>
    </button>
  );
});

LanguageToggle.displayName = 'LanguageToggle';

export default LanguageToggle;
