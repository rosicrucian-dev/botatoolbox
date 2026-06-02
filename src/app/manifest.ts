import { type MetadataRoute } from 'next'

// Required for static export: this is a route handler under the hood,
// and `output: 'export'` won't render it unless we opt into static.
export const dynamic = 'force-static'

// Web App Manifest — enables real PWA install on Android Chrome
// (full-app icon, splash, standalone window). iOS install is driven by
// the `appleWebApp` metadata in layout.tsx, not this manifest.
//
// Next emits this at /manifest.webmanifest at build time and injects the
// matching <link rel="manifest"> automatically.
//
// Icons: only the 16/32 favicon is present today; that's enough to make
// the install prompt available, but the install splash will scale the
// favicon up and look pixelated. Add 192x192 and 512x512 PNGs to
// `public/` and add their entries here when you want a clean splash.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BOTA Toolbox',
    short_name: 'BOTA Toolbox',
    description:
      'An unofficial set of advanced tools for members of the Builders of the Adytum.',
    start_url: '/',
    display: 'standalone',
    // Matches the viewport themeColor in layout.tsx so the install
    // splash and the browser chrome agree.
    background_color: '#18181b',
    theme_color: '#18181b',
    lang: 'en',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
    ],
  }
}
