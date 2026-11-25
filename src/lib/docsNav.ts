import { type Locale } from '@/lib/locales'
import { getNavigation, getNavTitleMap } from '@/lib/nav'
import {
  privateModeEnabled,
  privatePageIndex,
  type PrivatePageIndex,
} from '@/lib/privatePages'

/** The single navigation assembly path for initial render and local refresh. */
export function getDocsNavData(
  locale: Locale,
  index: PrivatePageIndex = privatePageIndex(),
) {
  const groups = getNavigation(locale).map((group) => ({
    ...group,
    links: [...group.links],
  }))
  if (privateModeEnabled()) {
    for (const page of index.pages) {
      if (page.locale !== 'all' && page.locale !== locale) continue
      const group = groups.find((entry) => entry.slug === page.group)
      if (group) group.links.push({ href: page.href, title: page.title })
    }
  }
  return { groups, titleMap: Object.fromEntries(getNavTitleMap(locale)) }
}
