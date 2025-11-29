import { memo, useContext } from 'react';
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
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group"
      aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      title={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
    >
      {/* Language Icon with animation */}
      <Languages 
        className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors duration-300" 
      />
      
      {/* Language Flag and Text */}
      <span className="flex items-center gap-1.5 font-medium text-sm">
        {language === 'en' ? (
          <>
            <span className="text-2xl leading-none" role="img" aria-label="English">🇺🇸</span>
            <span className="text-slate-300 group-hover:text-blue-400 transition-colors duration-300">EN</span>
          </>
        ) : (
          <>
            <span className="text-2xl leading-none" role="img" aria-label="Español">🇪🇸</span>
            <span className="text-slate-300 group-hover:text-blue-400 transition-colors duration-300">ES</span>
          </>
        )}
      </span>

      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      </div>
    </button>
  );
});

LanguageToggle.displayName = 'LanguageToggle';

export default LanguageToggle;
