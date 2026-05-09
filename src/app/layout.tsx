import { type Metadata, type Viewport } from 'next'

import { Providers } from '@/app/providers'

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
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#18181b',
  // Tells the browser we handle both color schemes ourselves (via
  // next-themes flipping the .dark class on <html>). Without this, iOS
  // Safari sometimes applies its own dark-mode treatment to sites it
  // can't detect as "dark-aware," causing white-on-white and frozen-toggle
  // symptoms on real devices that don't reproduce in the simulator.
  // Also makes native form controls / scrollbars track the right mode.
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
