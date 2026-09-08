'use client';
import { useTranslation } from '../hooks/useTranslation';
import { Mail, Linkedin, Github } from 'lucide-react';
import { SOCIAL } from '../data/social';

export default function Footer() {
  const { t } = useTranslation();
  const copyright = t('footer.copyright');
  const copyrightText =
    typeof copyright === 'string'
      ? copyright
          .replace('2025', String(new Date().getFullYear()))
          .replace('2026', String(new Date().getFullYear()))
      : '';

  return (
    <footer className="pt-[var(--section-pad-tight)] pb-[var(--space-lg)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 text-slate-600 dark:text-slate-400 relative z-10 transition-colors duration-300">
      <p className="text-xs sm:text-sm">{copyrightText}</p>
      <div className="flex items-center gap-4 sm:gap-4 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5">
        <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Linkedin className="w-5 h-5" aria-hidden="true" />
        </a>
        <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Github className="w-5 h-5" aria-hidden="true" />
        </a>
        <a href={`mailto:${SOCIAL.email}`} aria-label="Email Mateo" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-300">
          <Mail className="w-5 h-5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
