'use client';
import React, { memo, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

/**
 * ThemeToggle — sin burbuja.
 * Default: icono filled con color del tema (negro en light, blanco en dark).
 * Hover: fill -> transparent, dejando visible solo el stroke (outline tight
 * pegado al cuerpo del icono — lucide ya trae stroke="currentColor").
 */
const ThemeToggle = memo(() => {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-11 h-11 text-black dark:text-white transition-colors duration-300 group/toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Moon
          className="w-5 h-5 fill-current transition-all duration-300 group-hover/toggle:fill-transparent group-hover/toggle:scale-110"
          aria-hidden="true"
        />
      ) : (
        <Sun
          className="w-5 h-5 fill-current transition-all duration-300 group-hover/toggle:fill-transparent group-hover/toggle:scale-110"
          aria-hidden="true"
        />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
