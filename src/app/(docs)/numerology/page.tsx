import { type Metadata } from 'next'

import { numerology } from '@/content/data'

export const metadata: Metadata = {
  title: 'Numerology',
}

export default function NumerologyPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Numerology
      </h1>

      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full px-4 sm:px-6 lg:px-8">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <Th className="w-20">Number</Th>
                <Th>Meaning</Th>
              </tr>
            </thead>
            <tbody>
              {numerology.map((n) => (
                <tr key={n.num}>
                  <Td className="w-20">
                    <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                      {n.num}
                    </span>
                  </Td>
                  <Td>{n.meaning}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  )
}

const CELL =
  'border-b border-zinc-200 px-3 py-3 align-middle whitespace-nowrap dark:border-zinc-800'

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      scope="col"
      className={`${CELL} text-left font-semibold text-zinc-700 dark:text-zinc-300 ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={`${CELL} text-zinc-900 dark:text-zinc-100 ${className ?? ''}`}>
      {children}
    </td>
  )
}
