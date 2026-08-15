import { type Metadata, type Viewport } from 'next'

import { SPLASH_DEVICES, splashMedia, splashPath } from '@/lib/splash'

import '@/styles/tailwind.css'

// Cross-file integrity checks (mantraSlug → words.slug, ritual refs →
// words.slug, tree-paths → tarot, etc.). Throws at build/boot if
// anything is dangling. Each file's own Zod schema covers shape.
import '@/content/integrity'

export const metadata: Metadata = {
  // Resolves all relative URLs in metadata (canonical, og:url, og:image)
  // to the production origin. Without it, Next emits localhost URLs in
  // build output and Google can't resolve canonicals across crawlers.
  metadataBase: new URL('https://botatoolbox.org'),
  // Next's `appleWebApp.capable` only emits the modern `mobile-web-app-capable`.
  // iOS keys the launch splash (apple-touch-startup-image) off the legacy
  // apple-prefixed flag, so add it too — without it, standalone launches skip
  // the splash and flash a blank page on open.
  other: { 'apple-mobile-web-app-capable': 'yes' },
  title: {
    template: '%s - BOTA Toolbox',
    default: 'BOTA Toolbox',
  },
  description:
    'An unofficial set of advanced tools for members of the Builders of the Adytum.',
  // Open Graph drives rich previews in Discord/Slack/Twitter and is read
  // by some crawlers. `siteName` distinguishes the brand from per-page
  // titles in Google's results listings.
  openGraph: {
    title: 'BOTA Toolbox',
    description:
      'An unofficial set of advanced tools for members of the Builders of the Adytum.',
    url: 'https://botatoolbox.org',
    siteName: 'BOTA Toolbox',
    type: 'website',
  },
  // iOS "Add to Home Screen" treatment. `capable: true` runs the app in
  // standalone mode (no Safari chrome). `black-translucent` lets the
  // player slides extend under the status bar — the SlidePlayer already
  // pads with env(safe-area-inset-top) so content isn't occluded. The
  // title overrides the home-screen icon label (which otherwise inherits
  // the long page title).
  appleWebApp: {
    capable: true,
    title: 'BOTA Toolbox',
    statusBarStyle: 'black-translucent',
    // iOS launch screens (the cube on black/white per color scheme),
    // generated into public/splash/ by `npm run gen:splash` — device
    // list + media queries live in src/lib/splash.ts. Without these,
    // launching from the home screen flashes a blank white page.
    startupImage: SPLASH_DEVICES.flatMap((device) =>
      (['dark', 'light'] as const).map((scheme) => ({
        url: splashPath(scheme, device),
        media: splashMedia(scheme, device),
      })),
    ),
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Match the page background per scheme so browser chrome (Safari tab
  // bar, Android status bar) blends with the page instead of always
  // hinting dark against a white light-mode page. The UI follows the
  // system scheme (dark: is a prefers-color-scheme variant), so these
  // media-keyed metas are always correct; the SlidePlayer temporarily
  // overwrites them with the slide color (src/lib/themeColor.ts).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' },
  ],
  // Tells the browser this site is dark-aware. Without this, iOS Safari
  // sometimes applies its own dark-mode treatment to sites it can't
  // detect as such, causing white-on-white symptoms on real devices
  // that don't reproduce in the simulator. Also makes native form
  // controls / scrollbars track the right mode.
  colorScheme: 'light dark',
}

// Pass-through root layout. The real document (<html lang=...>, body,
// providers) lives in [locale]/layout.tsx so the lang attribute can
// follow the locale segment. This file still has to exist — the root
// not-found boundary renders into it (not-found.tsx supplies its own
// <html>) — and it keeps the site-wide metadata/viewport exports plus
// the stylesheet and integrity side-effect imports above.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
