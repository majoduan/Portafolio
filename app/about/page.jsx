'use client';

import { useTranslation } from '../../hooks/useTranslation';
import { Briefcase, Linkedin, Github, Mail } from 'lucide-react';
import RotatingTitle from '../../components/RotatingTitle';
import WorkTimeline from '../../components/WorkTimeline';
import EducationSection from '../../components/EducationSection';

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
    <div className="pt-8 md:pt-20">

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
                href="https://www.linkedin.com/in/mateodue/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
              >
                <Linkedin className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/mateo-dueñas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
              >
                <Github className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
              </a>
              <a
                href="mailto:mateo.duenas@epn.edu.ec"
                aria-label="Email Mateo"
                className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:bg-black dark:hover:bg-white group/icon shadow-card"
              >
                <Mail className="w-5 h-5 text-black dark:text-white group-hover/icon:text-white dark:group-hover/icon:text-black" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Timeline Work Experience ── */}
      <WorkTimeline items={experienceItems} t={t} />

      {/* ── SECTION 3: Education (spotlight + companion) ── */}
      <EducationSection items={educationItems} t={t} />

    </div>
  );
}
