import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'contexts', 'hooks', 'utils', 'data'],
  },
  // @splinetool/react-spline exports only ESM "import" condition
  // which Next.js webpack can't resolve. Point directly to the file.
  webpack: (config) => {
    config.resolve.alias['@splinetool/react-spline'] = resolve(
      __dirname,
      'node_modules/@splinetool/react-spline/dist/react-spline.js'
    );
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // CSP Note: 'unsafe-inline' and 'unsafe-eval' are required by @splinetool/runtime
            // which uses eval() for WebGL shader compilation. This is a known limitation.
            // Risk mitigated by: no user-generated content, no API routes, static deployment.
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://prod.spline.design; font-src 'self' data:; connect-src 'self' https://prod.spline.design wss://prod.spline.design; media-src 'self' blob:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/media/projects/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/docs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000' },
          { key: 'Content-Type', value: 'application/pdf' },
          { key: 'Content-Disposition', value: 'inline; filename="Mateo_Duenas_CV.pdf"' },
        ],
      },
    ];
  },
};

export default nextConfig;
