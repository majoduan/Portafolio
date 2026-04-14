'use client';

import Image from 'next/image';
import { useTranslation } from '../../hooks/useTranslation';
import { Trophy, Briefcase, Linkedin, Github, Mail, Calendar, MapPin } from 'lucide-react';
import RotatingTitle from '../../components/RotatingTitle';
import WorkTimeline from '../../components/WorkTimeline';

const experienceItems = [
  { key: 'bridge',           logos: ['/media/work-education/bridge-staff-120w.avif', '/media/work-education/acr-120w.avif'], present: true },
  { key: 'epnIntern',        logos: ['/media/work-education/direc-investigacion-120w.avif'] },
  { key: 'digitalInclusion', logos: ['/media/work-education/ludolab-120w.avif'] },
  { key: 'ieee',             logos: ['/media/work-education/ieee-120w.avif'] },
];

const educationItems = [
  { key: 'epn',     logos: ['/media/work-education/epn-120w.avif'],     primary: true },
  { key: 'english', logos: ['/media/work-education/cec-epn-120w.avif'] },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="pt-20">

      {/* Intro */}
      <section className="py-10 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-700 dark:text-slate-100 mb-2 font-medium transition-colors duration-300">
            {t('hero.name')}
          </p>
          <RotatingTitle titles={t('hero.titles')} />
          <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            {t('about.intro.bio')}
          </p>

          {/* CV Button + Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 max-[424px]:flex-col">
            <a
              href="/docs/Mateo_Duenas_CV.pdf"
              download="Mateo_Dueñas_CV.pdf"
              className="swap-btn"
              ref={(el) => {
                if (el) {
                  const text = el.querySelector('.swap-btn-text');
                  if (text) el.style.setProperty('--swap-text-w', `${text.offsetWidth}px`);
                  el.style.setProperty('--swap-btn-w', `${el.offsetWidth}px`);
                }
              }}
            >
              <span className="swap-btn-bg" />
              <span className="swap-btn-icon">
                <Briefcase className="w-5 h-5 text-white" />
              </span>
              <span className="swap-btn-text">
                {t('hero.downloadCV')}
              </span>
            </a>

            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/in/mateo-dueñas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              >
                <Linkedin className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" />
              </a>
              <a
                href="https://github.com/mateo-dueñas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              >
                <Github className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" />
              </a>
              <a
                href="mailto:mateo.duenas@epn.edu.ec"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              >
                <Mail className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Companies — hidden until ready */}
      <section className="hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('about.companies.title')}
          </h2>
        </div>
      </section>

      {/* ── SECTION 2: Timeline Work Experience ── */}
      <WorkTimeline items={experienceItems} t={t} />

      {/* ── SECTION 3: Achievement Cards Education ── */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 pb-2 leading-tight text-black dark:text-white">
            {t('about.education.title')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[11fr_9fr] gap-10 items-stretch">
            {educationItems.map((item, index) => {
              const highlights = t(`about.education.items.${item.key}.highlights`);
              const coursework = t(`about.education.items.${item.key}.coursework`);
              const courseworkTags = coursework && !coursework.includes('about.')
                ? coursework.split(', ')
                : [];

              return (
                <div
                  key={item.key}
                  className="flex flex-col relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col flex-1">
                    {/* Logo + degree header */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-2.5 flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={item.logos[0]}
                          alt=""
                          width={80}
                          height={80}
                          unoptimized
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">
                          {t(`about.education.items.${item.key}.degree`)}
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-0.5">
                          {t(`about.education.items.${item.key}.institution`)}
                        </p>
                        {/* Period pill */}
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full border border-[var(--accent-border-subtle)] bg-[var(--accent-bg-subtle)]">
                          <Calendar className="w-3 h-3 text-[var(--accent-solid)]" />
                          <span className="text-xs font-medium text-[var(--accent-solid)]">
                            {t(`about.education.items.${item.key}.period`)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trophy highlight badges */}
                    {Array.isArray(highlights) && highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/50"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Coursework as pill tags */}
                    {courseworkTags.length > 0 && (
                      <div className="mt-6 pt-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">
                          Coursework
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {courseworkTags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full border border-black dark:border-white text-black dark:text-white bg-transparent flex items-center"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
