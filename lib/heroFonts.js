// Tipografías "llamativas" para el efecto Typeface Transition del hero (home).
//
// Se cargan con next/font/google (self-hosted, sin layout shift) pero con
// `preload: false`: son DECORATIVAS, así que no compiten con los recursos
// críticos del primer render. El hook useTypefaceCycle las carga bajo demanda
// con la CSS Font Loading API (document.fonts.load) y solo arranca el efecto
// cuando están listas — sin FOUT a mitad de la animación.
//
// El orden está pensado para máximo contraste entre vecinas: cada tipografía es
// muy distinta de la anterior (condensada → serif → slab → líneas → script → ...).
import {
  Bebas_Neue,
  Playfair_Display,
  Rye,
  Monoton,
  Pacifico,
  Bungee,
  Special_Elite,
  Orbitron,
  Pirata_One,
  Abril_Fatface,
} from 'next/font/google';

// next/font exige objetos literales (analiza los argumentos en build), así que
// no se puede usar spread ni variables compartidas aquí.
const bebas        = Bebas_Neue({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const playfair     = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false, weight: '700' });
const rye          = Rye({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const monoton      = Monoton({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const pacifico     = Pacifico({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const bungee       = Bungee({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const specialElite = Special_Elite({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const orbitron     = Orbitron({ subsets: ['latin'], display: 'swap', preload: false, weight: '700' });
const pirata       = Pirata_One({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const abril        = Abril_Fatface({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });

// Secuencia ordenada por contraste entre vecinas. `family` es el font-family
// resuelto por next/font (incluye su fallback); `weight` evita el faux-bold en
// las fuentes de un solo peso.
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
];
