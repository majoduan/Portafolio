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
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Theme Icon with animation */}
      {theme === 'dark' ? (
        <Moon 
          className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors duration-300" 
          fill="currentColor"
        />
      ) : (
        <Sun 
          className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors duration-300" 
        />
      )}

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      </div>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
