import Link from 'next/link'
import { type Metadata } from 'next'

import { chakras } from '@/content/data'
import { planetBySlug } from '@/content/data/astrology'

export const metadata: Metadata = {
  title: 'Chakras',
}

export default function ChakrasPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Chakras
      </h1>

      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full px-4 sm:px-6 lg:px-8">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <Th>Planet</Th>
                <Th>Angel</Th>
                <Th>Metal</Th>
                <Th>Chakra</Th>
              </tr>
            </thead>
            <tbody>
              {chakras.map((c) => {
                const planet = planetBySlug[c.planet]
                return (
                  <tr key={c.planet}>
                    <Td>
                      {planet ? (
                        <Link
                          href={`/astrology/planets/${planet.slug}`}
                          className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                        >
                          {planet.name}
                        </Link>
                      ) : (
                        c.planet
                      )}
                    </Td>
                    <Td>{c.angel}</Td>
                    <Td>{c.metal}</Td>
                    <Td>{c.chakra}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}

const CELL =
  'border-b border-zinc-200 px-3 py-3 align-middle whitespace-nowrap dark:border-zinc-800'

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className={`${CELL} text-left font-semibold text-zinc-700 dark:text-zinc-300`}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className={`${CELL} text-zinc-900 dark:text-zinc-100`}>{children}</td>
  )
}
