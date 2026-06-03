'use client'

import Link from 'next/link'

import { navigation, type NavGroup } from '@/lib/nav'
import { useSecretMode } from '@/lib/useSecretMode'

// Home-page table of contents. Lives as a client component so it can
// filter out secret-mode-gated groups (e.g. Meditations) based on
// useSecretMode's localStorage-backed state.
export function NavSections() {
  const { unlocked } = useSecretMode()
  const visible = navigation.filter(
    (group) => group.gated !== 'secret' || unlocked,
  )
  return (
    <>
      {visible.map((group) => (
        <Section key={group.title} group={group} />
      ))}
    </>
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
