'use client';

import { useTranslation } from '../../hooks/useTranslation';
import { Trophy, Briefcase, Linkedin, Github, Mail } from 'lucide-react';

const experienceItems = [
  { key: 'bridge', logo: '/images/ACR.svg', present: true },
  { key: 'epnIntern', logo: '/images/epn-seeklogo 1.svg' },
  { key: 'digitalInclusion', logo: '/images/epn-seeklogo 1.svg' },
  { key: 'ieee', logo: '/images/IEEE.svg' },
];

const educationItems = [
  { key: 'epn', logo: '/images/epn-seeklogo 1.svg', primary: true },
  { key: 'english', logo: '/images/epn-seeklogo 1.svg' },
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="pt-20">
      {/* Intro */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-100 mb-2 font-medium transition-colors duration-300">
            {t('hero.name')}
          </p>
          <h1 className="hero-title text-black dark:text-white mb-8">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            {t('about.intro.bio')}
          </p>

          {/* CV Button + Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 max-[424px]:flex-col">
            <a
              href="/cv/Mateo_Dueñas_CV.pdf"
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

      {/* Companies - hidden until ready */}
      <section className="hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 pb-2 leading-tight text-black dark:text-white">
            {t('about.companies.title')}
          </h2>
        </div>
      </section>

      {/* Work Experience */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 pb-2 leading-tight text-black dark:text-white">
            {t('about.experience.title')}
          </h2>
          <div className="space-y-6">
            {experienceItems.map((item, index) => {
              const bullets = t(`about.experience.items.${item.key}.bullets`);
              const tag = t(`about.experience.items.${item.key}.tag`);
              return (
                <div
                  key={item.key}
                  className="about-card bg-white/80 dark:bg-[var(--bg-elevated-50)] backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-black dark:hover:border-white transition-all duration-300 shadow-md hover:shadow-xl p-5 md:p-6"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header: Logo + Title + Period */}
                  <div className="flex items-start gap-4">
                    <img
                      src={item.logo}
                      alt=""
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-1.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">
                          {t(`about.experience.items.${item.key}.role`)}
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-500 whitespace-nowrap">
                          {t(`about.experience.items.${item.key}.period`)}
                          {item.present ? ` – ${t('about.experience.present')}` : ''}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                        {t(`about.experience.items.${item.key}.company`)}
                        {tag && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full ml-2">
                            {tag}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                        {t(`about.experience.items.${item.key}.location`)}
                      </p>
                    </div>
                  </div>

                  {/* Bullets */}
                  {Array.isArray(bullets) && bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
                      {bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-slate-400 dark:text-slate-600 mt-1 flex-shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 pb-2 leading-tight text-black dark:text-white">
            {t('about.education.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-stretch">
            {educationItems.map((item, index) => {
              const highlights = t(`about.education.items.${item.key}.highlights`);
              const coursework = t(`about.education.items.${item.key}.coursework`);
              return (
                <div
                  key={item.key}
                  className="about-card flex flex-col bg-white/80 dark:bg-[var(--bg-elevated-50)] backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-black dark:hover:border-white transition-all duration-300 shadow-md hover:shadow-xl p-5 md:p-6"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.logo}
                      alt=""
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-1.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">
                        {t(`about.education.items.${item.key}.degree`)}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                        {t(`about.education.items.${item.key}.institution`)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                        {t(`about.education.items.${item.key}.location`)} · {t(`about.education.items.${item.key}.period`)}
                      </p>
                    </div>
                  </div>

                  {/* Highlights as badges */}
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

                  {/* Coursework */}
                  {coursework && (
                    <p className="mt-auto pt-3 text-sm text-slate-500 dark:text-slate-500">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Coursework: </span>
                      {coursework}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
