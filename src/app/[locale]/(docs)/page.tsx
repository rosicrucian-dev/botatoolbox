import { Link } from '@/components/LocaleLink'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { HeroPattern } from '@/components/HeroPattern'
import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'
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
        </header>
        <TableOfContents />
        <NavSections />
      </article>
    </>
  )
}
