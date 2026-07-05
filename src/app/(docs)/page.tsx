import { Link } from 'next-view-transitions'

import { ContinueChip } from '@/components/LastVisited'
import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'
import { NavSections } from './NavSections'

// No `metadata.title` here — falls back to layout's `default: 'BOTA
// Toolbox'`, which skips the `'%s - BOTA Toolbox'` template wrapping
// that other pages get. Home is the one place where "BOTA Toolbox -
// BOTA Toolbox" would be the wrong title.

export default function Home() {
  return (
    <article className="space-y-14">
      {/* The hero block — title, lead subtitle, and any short
          paragraphs of supporting copy — lives inside one <header>.
          Prose handles its own internal paragraph rhythm and the
          subtitle's `.lead` class gives it the muted hero-subtitle
          treatment. Keeping everything in <header> means the article's
          space-y-14 only fires between hero ↔ NavSections, not
          between title ↔ Prose. */}
      {/* The hero as a card, washed with an aurora of the cube's face
          colors — soft radial pools contained by the card's rounded
          bounds, so the flair has an edge to live inside instead of
          floating on the page. */}
      <header className="relative overflow-hidden rounded-2xl p-6 ring-1 ring-zinc-900/10 sm:p-8 dark:ring-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.22]"
          style={{
            background:
              'radial-gradient(55% 90% at 10% 0%, #3D5DAB 0%, transparent 70%), ' +
              'radial-gradient(50% 80% at 55% 15%, #F4ED38 0%, transparent 70%), ' +
              'radial-gradient(60% 110% at 100% 100%, #EF3125 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <PageHeading className="text-zinc-900">BOTA Toolbox</PageHeading>
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
          {/* One-tap jump back to the last-visited page — an installed
              home-screen app always relaunches here at /, so this is the
              "resume studying" affordance. Renders nothing on a first
              visit. */}
          <ContinueChip />
        </div>
      </header>
      <NavSections />
    </article>
  )
}
