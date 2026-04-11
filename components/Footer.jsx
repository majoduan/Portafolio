'use client';
import { useTranslation } from '../hooks/useTranslation';
import { Mail, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-4 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 text-slate-600 dark:text-slate-400 relative z-10 transition-colors duration-300">
      <p className="text-xs sm:text-sm">{t('footer.copyright').replace('2025', new Date().getFullYear()).replace('2026', new Date().getFullYear())}</p>
      <div className="flex items-center gap-4 sm:gap-4 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5">
        <a href="https://www.linkedin.com/in/mateo-dueñas" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="https://github.com/mateo-dueñas" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Github className="w-5 h-5" />
        </a>
        <a href="mailto:mateo.duenas@epn.edu.ec" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Mail className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
}
