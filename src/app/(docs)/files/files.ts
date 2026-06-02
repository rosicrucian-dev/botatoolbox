// Hardcoded list of downloadable files shown under /files.
// Grouped by section on the index page; each entry has a viewer route at
// /files/<slug>. Add new entries here as needed.

export interface FileEntry {
  slug: string
  name: string
  src: string
  section: string
}

export const files: ReadonlyArray<FileEntry> = [
  {
    slug: 'wallpaper',
    name: 'Wallpaper',
    src: '/files/wallpaper.jpg',
    section: 'Desktop',
  },
  {
    slug: 'mons-abiegnus',
    name: 'Mons Abiegnus',
    src: '/files/mons-abiegnus.jpg',
    section: 'Rosicrucian Art',
  },
]

export const fileBySlug = Object.fromEntries(
  files.map((f) => [f.slug, f]),
) as Record<string, FileEntry>

// Stable section ordering for the index page (insertion order of first
// occurrence in `files`).
export const sectionsInOrder: ReadonlyArray<string> = (() => {
  const seen = new Set<string>()
  const out: Array<string> = []
  for (const f of files) {
    if (!seen.has(f.section)) {
      seen.add(f.section)
      out.push(f.section)
    }
  }
  return out
})()
