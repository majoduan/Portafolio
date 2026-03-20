'use client';
import React, { memo, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AppContext } from '../contexts/AppContext';

/**
 * ThemeToggle Component
 * Renders a button to switch between dark and light themes
 * Shows moon icon in dark mode and sun icon in light mode
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const ThemeToggle = memo(() => {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-black dark:hover:bg-white group/toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-white group-hover/toggle:text-black transition-colors duration-300" fill="currentColor" />
      ) : (
        <Sun className="w-5 h-5 text-black group-hover/toggle:text-white transition-colors duration-300" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
