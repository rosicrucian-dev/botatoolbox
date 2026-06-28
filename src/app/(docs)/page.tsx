import Link from 'next/link'

import { AddToHomeHint } from './AddToHomeHint'
import { NavSections } from './NavSections'
import { Prose } from '@/components/Prose'

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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          BOTA Toolbox
        </h1>
        <Prose className="mt-2">
          <p className="lead">
            An unofficial set of advanced tools for members of the <a href="https://bota.org">Builders of the Adytum</a>. For more information see <Link href="/about">About</Link>.
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
  )
}
