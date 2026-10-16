import { tKey } from '@/content/messages'
import { type Locale } from '@/lib/locales'
import { getNavigation, getNavTitleMap } from '@/lib/nav'
import {
  privateLegacySlugs,
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
    const meditationGroup = groups.find((group) => group.slug === 'meditations')
    for (const slug of privateLegacySlugs()) {
      const href = `/meditations/${slug}`
      if (
        meditationGroup &&
        !meditationGroup.links.some((link) => link.href === href)
      ) {
        meditationGroup.links.push({
          href,
          title: tKey(locale, `nav.${href}.title`) ?? slug.replaceAll('-', ' '),
        })
      }
    }
    for (const page of index.pages) {
      if (page.locale !== 'all' && page.locale !== locale) continue
      const group = groups.find((entry) => entry.slug === page.group)
      if (group) group.links.push({ href: page.href, title: page.title })
    }
  }
  return { groups, titleMap: Object.fromEntries(getNavTitleMap(locale)) }
}
