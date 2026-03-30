import './globals.css';
import Providers from './providers';
import ClientInit from './client-init';
import BootScreenWrapper from './BootScreenWrapper';

export const metadata = {
  metadataBase: new URL('https://mateoduenas.vercel.app'),
  title: 'Mateo Dueñas | Full Stack Developer Portfolio',
  description: 'Portfolio de Mateo Dueñas - Full Stack Software Engineer especializado en React, Node.js, Python y tecnologías web modernas. Más de 2 años de experiencia en desarrollo web.',
  keywords: ['Mateo Dueñas', 'Full Stack Developer', 'Software Engineer', 'React', 'Node.js', 'Python', 'Portfolio', 'Web Development'],
  authors: [{ name: 'Mateo Dueñas' }],
  openGraph: {
    type: 'website',
    url: 'https://mateoduenas.vercel.app/',
    title: 'Mateo Dueñas | Full Stack Developer Portfolio',
    description: 'Portfolio profesional de Mateo Dueñas, Full Stack Software Engineer especializado en React, Node.js y tecnologías web modernas',
    images: [{ url: '/images/optimized/foto-perfil-1200w.avif', width: 800, height: 1000 }],
    locale: 'es_ES',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Dueñas | Full Stack Developer Portfolio',
    description: 'Portfolio profesional de Mateo Dueñas, Full Stack Software Engineer especializado en React, Node.js y tecnologías web modernas',
    images: ['/images/optimized/foto-perfil-1200w.avif'],
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
    canonical: 'https://mateoduenas.vercel.app/',
  },
  icons: {
    icon: '/bow-and-arrow.svg',
    apple: '/bow-and-arrow.svg',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Detect saved language/theme BEFORE React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.lang = localStorage.getItem('portfolio-language') || (navigator.language.startsWith('es') ? 'es' : 'en');
              if (localStorage.getItem('portfolio-theme') === 'light' || (!localStorage.getItem('portfolio-theme') && window.matchMedia('(prefers-color-scheme: light)').matches)) { document.documentElement.classList.remove('dark'); } else { document.documentElement.classList.add('dark'); }
            `,
          }}
        />
        {/* Resource hints for Spline 3D */}
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        {/* Prefetch profile image used in contact section */}
        <link rel="prefetch" href="/images/optimized/foto-perfil-800w.avif" as="image" type="image/avif" />
      </head>
      <body>
        <Providers>
          <ClientInit />
          <BootScreenWrapper>{children}</BootScreenWrapper>
        </Providers>
      </body>
    </html>
  );
}
