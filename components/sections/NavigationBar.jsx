'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Briefcase, Sun, Moon } from 'lucide-react';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';

const navItems = [
  { id: 'home', href: '/', icon: Home },
  { id: 'about', href: '/about', icon: User },
  { id: 'projects', href: '/projects', icon: Briefcase },
];

const NavigationBar = React.memo(() => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useContext(AppContext);
  const pathname = usePathname();

  return (
    <>
      {/* ─── Desktop Navigation — top fixed ─────────────────────── */}
      <nav
        className="hidden md:block fixed top-0 w-full bg-white/90 dark:bg-[var(--nav-bg)] backdrop-blur-md border-b border-slate-200 dark:border-white/20 z-50 transition-colors duration-300"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop menu - Centrado */}
            <div className="flex space-x-10 flex-1 justify-center">
              {navItems.map(({ id, href }) => (
                <Link
                  key={id}
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  className={`text-lg transition-all duration-300 relative group ${
                    pathname === href
                      ? 'text-black dark:text-white font-bold'
                      : 'text-gray-400 dark:text-gray-400 font-medium'
                  }`}
                >
                  {t(`nav.${id}`)}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gray-400 transition-all duration-300 ${
                      pathname === href ? '!bg-black dark:!bg-white w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Language and Theme Toggles - Desktop, con divider antes */}
            <div className="flex items-center gap-2">
              <div className="w-px h-6 bg-slate-300 dark:bg-white/20 mr-1" aria-hidden="true" />
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Navigation — bottom fixed, integra Theme + Lang toggles ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[var(--nav-bg)] backdrop-blur-md border-t border-slate-200 dark:border-white/20 z-50 transition-colors duration-300 pb-[env(safe-area-inset-bottom)]"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around h-14 px-1">
          {navItems.map(({ id, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex flex-col items-center justify-center px-2 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex-1 max-w-[80px] ${
                pathname === href
                  ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-white/10'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              aria-label={t(`nav.${id}`)}
            >
              <Icon className="w-5 h-5" strokeWidth={pathname === href ? 2.5 : 2} aria-hidden="true" />
              <span className="text-[10px] font-medium mt-0.5 leading-tight">
                {t(`nav.${id}`).split(' ')[0]}
              </span>
            </Link>
          ))}

          {/* Divider visual */}
          <div className="w-px self-center h-8 bg-slate-300 dark:bg-white/20 mx-1" aria-hidden="true" />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center px-2 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex-1 max-w-[64px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5" fill="currentColor" aria-hidden="true" />
            ) : (
              <Sun className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="text-[10px] font-medium mt-0.5 leading-tight">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex flex-col items-center justify-center px-2 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex-1 max-w-[64px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label={language === 'en' ? 'Switch to Spanish' : 'Switch to English'}
          >
            <span className="text-sm font-bold leading-none">
              {language === 'en' ? 'EN' : 'ES'}
            </span>
            <span className="text-[10px] font-medium mt-0.5 leading-tight">
              Lang
            </span>
          </button>
        </div>
      </nav>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
