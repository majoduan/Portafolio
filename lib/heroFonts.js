// Tipografías "llamativas" para el efecto Typeface Transition del hero (home).
//
// Se cargan con next/font/google (self-hosted, sin layout shift) pero con
// `preload: false`: son DECORATIVAS, así que no compiten con los recursos
// críticos del primer render. El hook useTypefaceCycle las carga bajo demanda
// con la CSS Font Loading API (document.fonts.load) y solo arranca el efecto
// cuando están listas — sin FOUT a mitad de la animación.
//
// El orden está pensado para máximo contraste entre vecinas: cada tipografía es
// muy distinta de la anterior. Además del barrido, ese orden es el de las fuentes
// "en reposo" entre ráfagas, así que dos reposos consecutivos también contrastan.
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
  Anton,
  Lobster,
  Creepster,
  Megrim,
  Shrikhand,
  Faster_One,
  Vast_Shadow,
  Rampart_One,
  Permanent_Marker,
  Silkscreen,
} from 'next/font/google';

// next/font exige objetos literales (analiza los argumentos en build): sin spread
// ni variables compartidas.
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
const anton        = Anton({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const lobster      = Lobster({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const creepster    = Creepster({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const megrim       = Megrim({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const shrikhand    = Shrikhand({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const fasterOne    = Faster_One({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const vastShadow   = Vast_Shadow({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const rampart      = Rampart_One({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const marker       = Permanent_Marker({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const silkscreen   = Silkscreen({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });

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
