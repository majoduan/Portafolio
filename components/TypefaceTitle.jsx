'use client';
import React, { useRef } from 'react';
import { useTypefaceCycle } from '../hooks/useTypefaceCycle';
import { HERO_CYCLE_FONTS } from '../lib/heroFonts';

/**
 * TypefaceTitle — <h1> del hero con efecto "Typeface Transition" (word-at-once).
 * useTypefaceCycle cambia el font-family de todo el título a la vez, en ciclos,
 * con tiempo muerto entre ráfagas. Ver hooks/useTypefaceCycle.js.
 */
const TypefaceTitle = React.memo(function TypefaceTitle({ text, className }) {
  const ref = useRef(null);
  const value = String(text ?? '');

  useTypefaceCycle(ref, HERO_CYCLE_FONTS, { text: value });

  return (
    <h1 ref={ref} className={className}>
      {value}
    </h1>
  );
});

export default TypefaceTitle;
