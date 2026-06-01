'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Award } from 'lucide-react';
import { useReversibleInView } from '../hooks/useReversibleInView';

/**
 * EducationSection — dos tarjetas iguales lado a lado.
 *
 * Mismo tratamiento para ambas (sin destacada/compañera, sin franja ni riel).
 * Conserva: logo + título + subtítulo, fila de fecha+ubicación (iconos neutros),
 * hover de acento de la tarjeta y reveal por scroll (.edu-card en globals.css).
 * Highlights: lista limpia con icono de acento. Coursework: texto en línea con
 * separadores (sin chips, sin hover).
 */

function EducationCard({ item, index, t }) {
  const ref = useRef(null);
  const inView = useReversibleInView(ref);
  const base = `about.education.items.${item.key}`;

  const degree = t(`${base}.degree`);
  const institution = t(`${base}.institution`);
  const period = t(`${base}.period`);
  const locationRaw = t(`${base}.location`);
  const location = locationRaw && !locationRaw.includes('about.') ? locationRaw : null;
  const highlights = t(`${base}.highlights`);
  const courseworkRaw = t(`${base}.coursework`);
  const courses = courseworkRaw && !courseworkRaw.includes('about.') ? courseworkRaw.split(', ') : [];

  return (
    <article
      ref={ref}
      data-revealed={inView ? 'true' : 'false'}
      style={{ transitionDelay: `${index * 120}ms` }}
      className="edu-card rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-card p-6 md:p-7 flex flex-col"
    >
      {/* Logo + título + subtítulo */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-2.5 shadow-md flex-shrink-0 flex items-center justify-center">
          <Image src={item.logos[0]} alt="" width={80} height={80} unoptimized className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white leading-tight">
            {degree}
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1">
            {institution}
          </p>
        </div>
      </div>

      {/* Fecha + ubicación (iconos neutros) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" aria-hidden="true" />
          {period}
        </span>
        {location && (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" aria-hidden="true" />
            {location}
          </span>
        )}
      </div>

      {/* Highlights — lista limpia con icono de acento */}
      {Array.isArray(highlights) && highlights.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2.5">
            {t('about.education.highlightsLabel')}
          </p>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm md:text-base text-slate-700 dark:text-slate-200">
                <Award className="w-4 h-4 mt-0.5 text-[var(--accent-solid)] flex-shrink-0" aria-hidden="true" />
                <span className="text-pretty">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coursework — texto en línea separado por puntos (sin chips, sin hover) */}
      {courses.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">
            {t('about.education.courseworkLabel')}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {courses.join('  ·  ')}
          </p>
        </div>
      )}
    </article>
  );
}

export default function EducationSection({ items, t }) {
  return (
    <section className="py-20 relative z-10 bg-transparent transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="title-glow text-4xl md:text-5xl font-bold text-center mb-12 pb-2 leading-tight text-black dark:text-white">
          {t('about.education.title')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {items.map((item, index) => (
            <EducationCard key={item.key} item={item} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
