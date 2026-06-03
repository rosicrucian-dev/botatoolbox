import { AddToHomeHint } from './AddToHomeHint'
import { NavSections } from './NavSections'

// No `metadata.title` here — falls back to layout's `default: 'BOTA
// Toolbox'`, which skips the `'%s - BOTA Toolbox'` template wrapping
// that other pages get. Home is the one place where "BOTA Toolbox -
// BOTA Toolbox" would be the wrong title.

export default function Home() {
  return (
    <article className="space-y-14">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          BOTA Toolbox
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
           An unofficial set of advanced tools for members of the Builders of the Adytum.
        </p>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
           Please exclude this website from any dark mode extensions so it doesn&apos;t interfere with the colors used for meditation.
        </p>
        <AddToHomeHint />
      </header>

      <NavSections />
    </article>
  )
}
