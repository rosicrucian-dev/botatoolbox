import { PageHeading } from '@/components/PageHeading'
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
      {
        name: 'An Esoteric Qabalistic Service',
        href: 'https://www.youtube.com/watch?v=S8YnSAd6UFk&list=PLX7ZN2l0whae__9ofuZE5vQqrgvJfJP2X',
      },
      {
        name: 'Ann Davies Classes',
        href: 'https://www.youtube.com/@BuildersOfTheAdytum/playlists',
      },
    ],
  },
  {
    title: 'Books',
    links: [
      {
        name: 'BOTA Books',
        href: 'https://storebota.org/collections/books',
      },
      {
        name: 'Paul Foster Case: His Life and Works',
        href: 'https://www.amazon.com/dp/B01K3M9N3Y',
      },
    ],
  },
]

export default function Links() {
  return (
    <article className="space-y-8">
      <PageHeading>Links</PageHeading>
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
