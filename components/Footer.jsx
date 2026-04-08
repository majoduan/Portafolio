'use client';
import { useTranslation } from '../hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400 relative z-10 transition-colors duration-300">
      <p>{t('footer.copyright').replace('2025', new Date().getFullYear()).replace('2026', new Date().getFullYear())}</p>
    </footer>
  );
}
