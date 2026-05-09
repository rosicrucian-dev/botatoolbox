import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Links',
}

const links: Array<{ name: string; href: string }> = [
  {
    name: 'Ann Davies Radio',
    href: 'https://botanz.airtime.pro/embed/player?stream=auto&skin=2',
  },
]

export default function Links() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Links
      </h1>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="-mx-2 block rounded-sm px-2 py-4 text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
            >
              {l.name}
            </a>
          </li>
        ))}
      </ul>
    </article>
  )
}
