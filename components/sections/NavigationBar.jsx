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
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-[var(--nav-bg)] backdrop-blur-lg border-b border-slate-200 dark:border-white/20 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Desktop menu - Centrado */}
            <div className="flex space-x-10 flex-1 justify-center">
              {navItems.map(({ id, href }) => (
                <Link
                  key={id}
                  href={href}
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

            {/* Language and Theme Toggles - Desktop */}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation - Always visible with icons */}
          <div className="md:hidden flex items-center justify-center h-14 px-1">
            {/* Navigation Icons - Centered */}
            <div className="flex items-center justify-around gap-1">
              {navItems.map(({ id, href, icon: Icon }) => (
                <Link
                  key={id}
                  href={href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    pathname === href
                      ? 'text-black dark:text-white font-bold bg-gray-100 dark:bg-white/10'
                      : 'text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                  aria-label={t(`nav.${id}`)}
                >
                  <Icon className="w-5 h-5" strokeWidth={pathname === href ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-0.5 leading-tight">
                    {t(`nav.${id}`).split(' ')[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Action Buttons - Mobile Only (bottom-left) */}
      <div className="md:hidden fixed bottom-6 left-4 z-50 flex flex-col gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-14 h-14 rounded-full bg-white dark:bg-[var(--bg-elevated)] shadow-lg hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="w-6 h-6 text-slate-300" />
          ) : (
            <Sun className="w-6 h-6 text-amber-500" />
          )}
        </button>

        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="w-14 h-14 rounded-full bg-white dark:bg-[var(--bg-elevated)] shadow-lg hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle language"
        >
          <span className="text-2xl leading-none flex items-center justify-center h-full" role="img" aria-label={language === 'en' ? 'English' : 'Español'}>
            {language === 'en' ? '🇺🇸' : '🇪🇸'}
          </span>
        </button>
      </div>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;
