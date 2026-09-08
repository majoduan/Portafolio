import './globals.css';
import { GeistSans } from 'geist/font/sans';
import Providers from './providers';
import ClientInit from './client-init';
import BootScreenWrapper from './BootScreenWrapper';
import Footer from '../components/Footer';
import { SITE_URL } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Mateo Dueñas | Full Stack Developer Portfolio',
  description: 'Portfolio de Mateo Dueñas - Full Stack Software Engineer especializado en React, Node.js, Python y tecnologías web modernas. Más de 2 años de experiencia en desarrollo web.',
  keywords: ['Mateo Dueñas', 'Full Stack Developer', 'Software Engineer', 'React', 'Node.js', 'Python', 'Portfolio', 'Web Development'],
  authors: [{ name: 'Mateo Dueñas' }],
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/`,
    title: 'Mateo Dueñas | Full Stack Developer Portfolio',
    description: 'Portfolio profesional de Mateo Dueñas, Full Stack Software Engineer especializado en React, Node.js y tecnologías web modernas',
    images: [{ url: '/media/profile/foto-perfil-1200w.avif', width: 800, height: 1000 }],
    locale: 'es_ES',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Dueñas | Full Stack Developer Portfolio',
    description: 'Portfolio profesional de Mateo Dueñas, Full Stack Software Engineer especializado en React, Node.js y tecnologías web modernas',
    images: ['/media/profile/foto-perfil-1200w.avif'],
    creator: '@mateoduenas',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  icons: {
    icon: '/icons/bow-and-arrow.svg',
    apple: '/icons/bow-and-arrow.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        {/* Detect saved language/theme BEFORE React hydrates to prevent flash.
            try/catch: localStorage lanza SecurityError en Safari privado o con
            almacenamiento bloqueado; sin el guard el script aborta y el tema
            no se aplica (flash claro/oscuro). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){try{var l=localStorage.getItem('portfolio-language');var t=localStorage.getItem('portfolio-theme');}catch(e){var l=null,t=null;}
              document.documentElement.lang = l || (navigator.language.indexOf('es')===0 ? 'es' : 'en');
              if (t === 'light' || (!t && window.matchMedia('(prefers-color-scheme: light)').matches)) { document.documentElement.classList.remove('dark'); } else { document.documentElement.classList.add('dark'); }})();
            `,
          }}
        />
        {/* Resource hints for Spline 3D */}
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        {/* Prefetch profile image used in contact section — variante por viewport */}
        <link
          rel="prefetch"
          href="/media/profile/foto-perfil-400w.avif"
          as="image"
          type="image/avif"
          media="(max-width: 767px)"
        />
        <link
          rel="prefetch"
          href="/media/profile/foto-perfil-800w.avif"
          as="image"
          type="image/avif"
          media="(min-width: 768px)"
        />
      </head>
      <body>
        <Providers>
          <ClientInit />
          <BootScreenWrapper footer={<Footer />}>{children}</BootScreenWrapper>
        </Providers>
      </body>
    </html>
  );
}
