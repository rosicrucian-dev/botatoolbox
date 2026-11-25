// THE TOOLS GROUP. A tool is one sidebar row with several views behind
// it, each view its own route and the switch between them a real link —
// the shape /keyboard has had all along (KeyboardLayout), now the shape
// Gematria and Astrology have too.
//
// Why routes and not a tab's worth of client state: a bookmark and a
// search result still name the view; each view keeps its own bundle
// (the dictionary's 1.6 MB word list never loads for someone computing
// a value); and Hora asks for the reader's location ON MOUNT, which
// must happen when they ask for planetary hours and not when they open
// a chart.
//
// The tool's own href IS one of its views — /gematria is the calculator,
// /keyboard is the piano — so the sidebar row lands on the common case
// in one click instead of on an index of cards. It need not be the
// FIRST tab: the keyboard's tableau is drawn left of its piano and was
// before this. The other views are `/<tool>/<view>`, off the sidebar but
// in the sitemap and the search index (see TOOL_TABS).
//
// Display strings: the ROW's title is the message catalog's
// `nav.<href>.title`, as every nav link's is. The tab LABELS are here,
// beside the hrefs they belong to, as the keyboard's are in its layout.

export interface Tool {
  /** Its nav href, which is also its first view. */
  href: string
  /** The heading every one of its views carries. */
  title: string
  tabs: ReadonlyArray<{ href: string; label: string }>
}

export const TOOLS: ReadonlyArray<Tool> = [
  {
    href: '/astrology',
    title: 'Astrology',
    tabs: [
      { href: '/astrology', label: 'Chart' },
      { href: '/astrology/hora', label: 'Hora' },
    ],
  },
  {
    href: '/keyboard',
    title: 'Keyboard',
    tabs: [
      { href: '/keyboard/tableau', label: 'Tableau' },
      { href: '/keyboard', label: 'Piano' },
    ],
  },
  {
    href: '/gematria',
    title: 'Gematria',
    tabs: [
      { href: '/gematria', label: 'Calculator' },
      { href: '/gematria/dictionary', label: 'Dictionary' },
    ],
  },
]

/**
 * Every view that is not its tool's own href: a page with no nav entry
 * of its own. The sitemap and the search index read this, so a tab is
 * never a page only a tab can reach.
 */
export const TOOL_TABS: ReadonlyArray<{ href: string; label: string }> =
  TOOLS.flatMap((tool) => tool.tabs.filter((tab) => tab.href !== tool.href))

/** Which view of a tool a path is, for `ToolLayout`'s `active`. */
export function viewOf(tool: Tool, path: string): string {
  return tool.tabs.find((tab) => tab.href === path)?.href ?? tool.href
}

export function toolFor(href: string): Tool {
  const tool = TOOLS.find((t) => t.href === href)
  if (!tool) throw new Error(`tools: no tool at ${href}`)
  return tool
}
