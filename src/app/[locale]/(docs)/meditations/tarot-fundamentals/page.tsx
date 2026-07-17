import { Link } from '@/components/LocaleLink'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { getMeditations, isRestDay } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

// Structural (slug) enumeration — English source on purpose.
const { tarotFundamentalsDays } = getMeditations(DEFAULT_LOCALE)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Tarot Fundamentals'),
  }
}

const ROW =
  '-mx-2 flex items-center justify-between gap-4 rounded-sm px-2 py-3 transition'

export default function TarotFundamentalsIndex() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs
        items={[
          { label: 'Meditations', href: '/meditations' },
          { label: 'Tarot Fundamentals' },
        ]}
      />
      <PageHeading>Tarot Fundamentals</PageHeading>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {tarotFundamentalsDays.map((d) => {
          const rest = isRestDay(d.day)
          const label = (
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Day {d.day}
            </span>
          )
          if (rest) {
            return (
              <li key={d.day}>
                <div
                  className={`${ROW} cursor-not-allowed opacity-50`}
                  aria-disabled="true"
                >
                  {label}
                  <span className="text-xs text-zinc-400">Rest</span>
                </div>
              </li>
            )
          }
          return (
            <li key={d.day}>
              <Link
                href={`/meditations/tarot-fundamentals/day-${d.day}`}
                className={`${ROW} hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
              >
                {label}
                <span className="text-zinc-400" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
