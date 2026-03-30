'use client';

import { useTranslation } from '../../hooks/useTranslation';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="pt-20">
      {/* Work Experience */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('about.experience.title')}
          </h2>
        </div>
      </section>

      {/* Education */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('about.education.title')}
          </h2>
        </div>
      </section>

      {/* Technical Skills */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('about.skills.title')}
          </h2>
        </div>
      </section>
    </main>
  );
}
