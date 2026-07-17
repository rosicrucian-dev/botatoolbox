import { ViewTransitions } from 'next-view-transitions'

import { Providers } from '@/app/providers'
import { LocaleProvider } from '@/components/LocaleProvider'
import { t } from '@/content/messages'
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  RELEASED_LOCALES,
  toLocale,
  TRANSLATION_LOCALES,
} from '@/lib/locales'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

// Localize the site-wide description (the root layout's metadata keeps
// the brand title template; German pages override just the description
// via the message catalog — falls back to English until translated).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const description = t(toLocale((await params).locale), 'site.description')
  return {
    description,
    openGraph: {
      title: 'BOTA Toolbox',
      description,
      url: 'https://botatoolbox.org',
      siteName: 'BOTA Toolbox',
      type: 'website' as const,
    },
  }
}

// Static export: only the locales above exist. Without this, dev would
// render any first segment (/fr/, /tarot/) as the home page with a
// bogus locale param instead of 404ing like the exported site does.
export const dynamicParams = false

// Pre-hydration language bounce, emitted only into English pages and
// only acting on the home page ('/'): an installed home-screen app
// always relaunches at start_url '/', and a brand-new visitor with a
// translated-locale browser lands there too — both get sent to their
// locale's home before first paint (the script sits ahead of all
// content, and under the iOS standalone splash it runs before anything
// is visible). Deep links never bounce, and any explicit switch (header
// dropdown / settings) writes 'bota:locale', which this reads first —
// so choosing English once silences it for good. The navigator check
// also writes the key, making the auto-detection literally
// first-visit-only. The locale list is baked in from TRANSLATION_LOCALES
// at build, so new locales join the bounce automatically.
const BOUNCE_LOCALES = TRANSLATION_LOCALES.filter((l) =>
  RELEASED_LOCALES.includes(l),
)

const bounceScript = `try {
  if (location.pathname === '/') {
    var locales = ${JSON.stringify(BOUNCE_LOCALES)};
    var s = localStorage.getItem('bota:locale');
    var target = locales.indexOf(s) !== -1
      ? s
      : !s
        ? (navigator.languages || [navigator.language])
            .map(function (l) { return String(l).split('-')[0]; })
            .filter(function (l) { return locales.indexOf(l) !== -1; })[0]
        : null;
    if (target) {
      if (!s) localStorage.setItem('bota:locale', target);
      location.replace('/' + target + '/');
    }
  }
} catch (e) {}`

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  // Next's layout validator wants the broad param type; dynamicParams
  // above guarantees only real locales ever reach us — isLocale narrows.
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE
  return (
    // ViewTransitions wraps navigations from the next-view-transitions
    // Link/useTransitionRouter (docs-side nav) in
    // document.startViewTransition — a quick cross-fade between pages
    // (see the ::view-transition rules in tailwind.css). Browsers
    // without the API, and the full-screen players (which keep plain
    // next/link + next/navigation so the iOS toolbar-priming dance is
    // undisturbed), navigate instantly as before.
    <ViewTransitions>
      <html lang={locale} className="h-full">
        <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
          {locale === DEFAULT_LOCALE && BOUNCE_LOCALES.length > 0 && (
            <script dangerouslySetInnerHTML={{ __html: bounceScript }} />
          )}
          <LocaleProvider locale={locale}>
            <Providers>
              <div className="w-full">{children}</div>
            </Providers>
          </LocaleProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
