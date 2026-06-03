import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Links',
}

interface LinkItem {
  name: string
  href: string
}

const sections: Array<{ title: string; links: Array<LinkItem> }> = [
  {
    title: 'Official',
    links: [
      { name: 'Builders of the Adytum', href: 'https://bota.org' },
    ],
  },
]

export default function Links() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Links
      </h1>
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {section.title}
          </h2>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {section.links.map((l) => (
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
        </section>
      ))}
    </article>
  )
}
