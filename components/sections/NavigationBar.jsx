'use client';
import React, { useState, useEffect, useContext } from 'react';
import { Home, Cpu, Award, Briefcase, MessageCircle, Sun, Moon } from 'lucide-react';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';

const NavigationBar = React.memo(() => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useContext(AppContext);
  const [activeSection, setActiveSection] = useState('home');

  // Detect active section on scroll - optimizado con throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['home', 'technologies', 'certificates', 'projects', 'contact'];
          const scrollPosition = window.scrollY + 150;

          if (window.scrollY < 100) {
            setActiveSection('home');
            ticking = false;
            return;
          }

          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isAtBottom = windowHeight + window.scrollY >= documentHeight - 50;

          if (isAtBottom) {
            setActiveSection('contact');
            ticking = false;
            return;
          }

          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const element = document.getElementById(section);
            if (element) {
              const { offsetTop } = element;
              if (scrollPosition >= offsetTop) {
                setActiveSection(section);
                break;
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-[var(--nav-bg)] backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Desktop menu - Centrado */}
            <div className="flex space-x-10 flex-1 justify-center">
              {['home', 'technologies', 'certificates', 'projects', 'contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`text-lg font-medium transition-all duration-300 relative group ${
                    activeSection === item
                      ? 'text-[var(--accent-solid)]'
                      : 'text-slate-700 dark:text-slate-300 hover:text-[var(--accent-solid)]'
                  }`}
                >
                  {t(`nav.${item}`)}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)] transition-all duration-300 ${
                      activeSection === item ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
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
              {[
                { id: 'home', icon: Home },
                { id: 'technologies', icon: Cpu },
                { id: 'certificates', icon: Award },
                { id: 'projects', icon: Briefcase },
                { id: 'contact', icon: MessageCircle }
              // eslint-disable-next-line no-unused-vars
              ].map(({ id, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    activeSection === id
                      ? 'text-[var(--accent-solid)] bg-red-50 dark:bg-[var(--accent-bg-muted)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[var(--accent-solid)] hover:bg-slate-100 dark:hover:bg-[var(--bg-elevated-50)]'
                  }`}
                  aria-label={t(`nav.${id}`)}
                >
                  <Icon className="w-5 h-5" strokeWidth={activeSection === id ? 2.5 : 2} />
                  <span className="text-[10px] font-medium mt-0.5 leading-tight">
                    {t(`nav.${id}`).split(' ')[0]}
                  </span>
                </a>
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
