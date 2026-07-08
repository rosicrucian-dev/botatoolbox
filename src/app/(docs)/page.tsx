import { Link } from 'next-view-transitions'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { ContinueChip } from '@/components/LastVisited'
import { HeroPattern } from '@/components/HeroPattern'
import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'
import { NavSections } from './NavSections'

// No `metadata.title` here — falls back to layout's `default: 'BOTA
// Toolbox'`, which skips the `'%s - BOTA Toolbox'` template wrapping
// that other pages get. Home is the one place where "BOTA Toolbox -
// BOTA Toolbox" would be the wrong title.

export default function Home() {
  return (
    <>
      {/* The Protocol template's homepage flair — a green grid/gradient
          wash behind the top of the page. Rendered as a sibling of the
          article (not inside its space-y-14) so its absolute box doesn't
          count as a flow child and push the header down. It anchors to
          the Layout's `relative` content wrapper. */}
      <HeroPattern />
      <SetBreadcrumbs items={[{ label: 'Overview' }]} />
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
      <NavSections />
      </article>
    </>
  )
}
