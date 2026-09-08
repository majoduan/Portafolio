// Tipografías "llamativas" para el efecto Typeface Transition del hero (home).
//
// Self-hosted con next/font/local desde assets/fonts/hero/*.woff2: subconjuntos
// generados por scripts/subset-hero-fonts.mjs (Google Fonts `text=`, solo los
// glifos del título + alfabeto/acentos). Antes next/font/google traía cada
// familia completa: 169 woff2 (2,9 MB) en el build, ≈ 500 KB descargados al
// arrancar el ciclo y ≈ 90 KB de CSS @font-face render-blocking en TODAS las
// rutas. Ahora: 20 archivos, 289 KB en total, ~3 KB de CSS.
//
// `preload: false`: son DECORATIVAS; useTypefaceCycle las carga bajo demanda con
// la CSS Font Loading API cuando el boot termina y el hero está en viewport.
//
// El orden está pensado para máximo contraste entre vecinas (ver hook).
import localFont from 'next/font/local';

// next/font exige objetos literales (analiza los argumentos en build).
const bebas        = localFont({ src: '../assets/fonts/hero/bebas-neue-400.woff2',       display: 'swap', preload: false, weight: '400' });
const playfair     = localFont({ src: '../assets/fonts/hero/playfair-display-700.woff2', display: 'swap', preload: false, weight: '700' });
const rye          = localFont({ src: '../assets/fonts/hero/rye-400.woff2',              display: 'swap', preload: false, weight: '400' });
const monoton      = localFont({ src: '../assets/fonts/hero/monoton-400.woff2',          display: 'swap', preload: false, weight: '400' });
const pacifico     = localFont({ src: '../assets/fonts/hero/pacifico-400.woff2',         display: 'swap', preload: false, weight: '400' });
const bungee       = localFont({ src: '../assets/fonts/hero/bungee-400.woff2',           display: 'swap', preload: false, weight: '400' });
const specialElite = localFont({ src: '../assets/fonts/hero/special-elite-400.woff2',    display: 'swap', preload: false, weight: '400' });
const orbitron     = localFont({ src: '../assets/fonts/hero/orbitron-700.woff2',         display: 'swap', preload: false, weight: '700' });
const pirata       = localFont({ src: '../assets/fonts/hero/pirata-one-400.woff2',       display: 'swap', preload: false, weight: '400' });
const abril        = localFont({ src: '../assets/fonts/hero/abril-fatface-400.woff2',    display: 'swap', preload: false, weight: '400' });
const anton        = localFont({ src: '../assets/fonts/hero/anton-400.woff2',            display: 'swap', preload: false, weight: '400' });
const lobster      = localFont({ src: '../assets/fonts/hero/lobster-400.woff2',          display: 'swap', preload: false, weight: '400' });
const creepster    = localFont({ src: '../assets/fonts/hero/creepster-400.woff2',        display: 'swap', preload: false, weight: '400' });
const megrim       = localFont({ src: '../assets/fonts/hero/megrim-400.woff2',           display: 'swap', preload: false, weight: '400' });
const shrikhand    = localFont({ src: '../assets/fonts/hero/shrikhand-400.woff2',        display: 'swap', preload: false, weight: '400' });
const fasterOne    = localFont({ src: '../assets/fonts/hero/faster-one-400.woff2',       display: 'swap', preload: false, weight: '400' });
const vastShadow   = localFont({ src: '../assets/fonts/hero/vast-shadow-400.woff2',      display: 'swap', preload: false, weight: '400' });
const rampart      = localFont({ src: '../assets/fonts/hero/rampart-one-400.woff2',      display: 'swap', preload: false, weight: '400' });
const marker       = localFont({ src: '../assets/fonts/hero/permanent-marker-400.woff2', display: 'swap', preload: false, weight: '400' });
const silkscreen   = localFont({ src: '../assets/fonts/hero/silkscreen-400.woff2',       display: 'swap', preload: false, weight: '400' });

// Secuencia ordenada por contraste entre vecinas (20 fuentes). `family` es el
// font-family resuelto por next/font (incluye su fallback); `weight` evita el
// faux-bold en las fuentes de un solo peso.
export const HERO_CYCLE_FONTS = [
  { family: bebas.style.fontFamily,        weight: 400 }, // condensada sans
  { family: playfair.style.fontFamily,     weight: 700 }, // serif de alto contraste
  { family: rye.style.fontFamily,          weight: 400 }, // slab western
  { family: monoton.style.fontFamily,      weight: 400 }, // retro multilínea
  { family: pacifico.style.fontFamily,     weight: 400 }, // script de pincel
  { family: bungee.style.fontFamily,       weight: 400 }, // bloque señalética
  { family: specialElite.style.fontFamily, weight: 400 }, // máquina de escribir
  { family: orbitron.style.fontFamily,     weight: 700 }, // geométrica techno
  { family: pirata.style.fontFamily,       weight: 400 }, // blackletter
  { family: abril.style.fontFamily,        weight: 400 }, // didone gruesa
  { family: anton.style.fontFamily,        weight: 400 }, // grotesca pesada condensada
  { family: lobster.style.fontFamily,      weight: 400 }, // script clásico
  { family: creepster.style.fontFamily,    weight: 400 }, // terror / goteo
  { family: megrim.style.fontFamily,       weight: 400 }, // geométrica fina
  { family: shrikhand.style.fontFamily,    weight: 400 }, // display gruesa juguetona
  { family: fasterOne.style.fontFamily,    weight: 400 }, // velocidad / futurista
  { family: vastShadow.style.fontFamily,   weight: 400 }, // serif con sombra
  { family: rampart.style.fontFamily,      weight: 400 }, // 3D extruida / contorno
  { family: marker.style.fontFamily,       weight: 400 }, // marcador a mano
  { family: silkscreen.style.fontFamily,   weight: 400 }, // pixel / bitmap
];
