import { ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid'

import { Link } from '@/components/locale/LocaleLink'

import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { HeroPattern } from '@/components/ui/HeroPattern'
import { Prose } from '@/components/ui/Prose'
import { DEFAULT_LOCALE, RELEASED_LOCALES, toLocale } from '@/lib/locales'
import { NavSections } from './NavSections'
import { TableOfContents } from './TableOfContents'

// No `metadata.title` here — falls back to layout's `default: 'BOTA
// Toolbox'`, which skips the `'%s - BOTA Toolbox'` template wrapping
// that other pages get. Home is the one place where "BOTA Toolbox -
// BOTA Toolbox" would be the wrong title.

// English is served unprefixed (scripts/hoist-en.ts lifts out/en/ to the
// root), every other locale under /<locale>. Same rule the sitemap uses.
function localeUrl(locale: string): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}`
}

// Canonical + hreflang in the document head. The sitemap already carries
// these alternates, but crawlers weight the in-page tags too, and the
// canonical is what marks this URL as the domain's homepage — the page
// Google reads the site name from. Relative paths resolve against the
// root layout's `metadataBase`. Deliberately scoped to this page rather
// than the [locale] layout: layout metadata is inherited by every child
// route, which would stamp the homepage's canonical onto all of them.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    alternates: {
      canonical: localeUrl(locale),
      languages: {
        ...Object.fromEntries(RELEASED_LOCALES.map((l) => [l, localeUrl(l)])),
        'x-default': localeUrl(DEFAULT_LOCALE),
      },
    },
  }
}

// Google builds the site-name line in search results (the bit above the
// URL, which was rendering as the bare "botatoolbox.org") from, in order
// of preference: WebSite structured data, og:site_name, the homepage
// <title>, then the domain as a last resort. The latter two were already
// correct, but with no structured data anywhere on the site Google fell
// through to the domain — this supplies the source it actually honors.
// Only the homepage needs it: site name is a domain-level property that
// Google extracts from the root. `url` stays the site root in every
// locale, since that identifies the site rather than this document.
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BOTA Toolbox',
  url: 'https://botatoolbox.org',
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* The Protocol template's homepage flair — a green grid/gradient
          wash behind the top of the page. Rendered as a sibling of the
          article (not inside its space-y-14) so its absolute box doesn't
          count as a flow child and push the header down. It anchors to
          the Layout's `relative` content wrapper. */}
      <HeroPattern />
      <SetBreadcrumbs items={[{ label: 'Home' }]} />
      <article className="space-y-14">
        {/* The hero block — title, lead subtitle, and any short
          paragraphs of supporting copy — lives inside one <header>.
          Prose handles its own internal paragraph rhythm and the
          subtitle's `.lead` class gives it the muted hero-subtitle
          treatment. Keeping everything in <header> means the article's
          space-y-14 only fires between hero ↔ NavSections, not
          between title ↔ Prose. */}
        <header>
          {/* Heading and the "Continue" chip share one row — the chip is
            right-aligned to the title so it uses the empty horizontal
            space beside it instead of adding a vertical band below.
            ContinueChip is lg:hidden, so on desktop the heading sits
            alone at the start. */}
          <div className="flex items-center justify-between gap-16">
            <PageHeading className="shrink-0 text-zinc-900">
              BOTA Toolbox
            </PageHeading>
            {/* <ContinueChip /> */}
          </div>
          <Prose className="mt-2">
            <p className="lead">
              An unofficial set of advanced tools for members of the{' '}
              <a href="https://bota.org">Builders of the Adytum</a>. For more
              information see <Link href="/about">About</Link>.
            </p>
            {/* <p>
            You can support this project with{' '}
            <a href="https://buymeacoffee.com/rosicruciandev">Buy Me a Coffee</a>
            . Thank you! 🌹
          </p> */}
          </Prose>
          <div className="mt-6 flex max-w-3xl items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm/6 text-emerald-800 shadow-sm shadow-emerald-900/5 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-none">
            <ChatBubbleLeftRightIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-emerald-500 dark:text-emerald-400"
            />
            <p>
              Join the new forum at{' '}
              <a
                href="https://pfclist.org"
                className="font-semibold text-emerald-900 underline decoration-emerald-500/50 underline-offset-2 transition hover:decoration-emerald-600 dark:text-emerald-100 dark:decoration-emerald-400/50 dark:hover:decoration-emerald-300"
              >
                pfclist.org
              </a>{' '}
              to discuss BOTA-related topics.
            </p>
          </div>
        </header>
        <TableOfContents />
        <NavSections />
      </article>
    </>
  )
}
