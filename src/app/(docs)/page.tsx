import Link from 'next/link'

import { navigation, type NavGroup } from '@/lib/nav'
import { AddToHomeHint } from './AddToHomeHint'

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
           Please exclude this website from any dark mode extensions like Dark Reader or Noir so it doesn't interfere with the colors used for meditation.
        </p>
        <AddToHomeHint />
      </header>

      {navigation.map((group) => (
        <Section key={group.title} group={group} />
      ))}
    </article>
  )
}

function Section({ group }: { group: NavGroup }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {group.title}
      </h2>
      <div className="mt-4 border-t border-zinc-900/5 pt-6 dark:border-white/5">
        <ul className="space-y-3">
          {group.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-base font-medium text-zinc-900 transition hover:text-emerald-500 dark:text-white dark:hover:text-emerald-400"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
