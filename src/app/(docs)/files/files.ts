// Hardcoded list of downloadable files shown under /files, grouped by section.
// Most entries have a viewer route at /files/<slug>; entries marked `direct`
// link straight to `src` as a download and have no viewer page.

export interface FileDownload {
  label: string
  src: string
}

export interface FileEntry {
  slug: string
  name: string
  // Image shown in the viewer. For PDFs this is a separate preview image,
  // since an <img> can't render a PDF.
  src: string
  section: string
  description?: string
  // When present, the viewer shows one button per download instead of a
  // single Download of `src` (e.g. A4 + Letter variants of a print).
  downloads?: ReadonlyArray<FileDownload>
  // `direct` entries are listed as a plain download link (no viewer page).
  direct?: boolean
  // When set, the viewer shows the tarot tableau spread (from this image set)
  // as the preview instead of a single <img src>.
  tableau?: 'major' | 'major-alt'
  // Set false to drop the rounded corners on the viewer preview image (e.g. for
  // full-bleed art where rounding clips the corners).
  rounded?: boolean
}

const BOOKS_SECTION = 'Books - Early Writings Curriculum'

export const files: ReadonlyArray<FileEntry> = [
  {
    slug: 'cube-of-space',
    name: 'Printable Cube of Space',
    src: '/files/cube-of-space-net-preview.jpg',
    section: 'Downloads',
    description: '',
    downloads: [
      { label: 'Download A4', src: '/files/cube-of-space-net-a4.pdf' },
      { label: 'Download US Letter', src: '/files/cube-of-space-net-letter.pdf' },
    ],
  },
  {
    slug: 'tarot-images',
    name: 'Tarot Images',
    src: '/files/Tarot Images.zip',
    section: 'Downloads',
    tableau: 'major',
    downloads: [{ label: 'Download ZIP', src: '/files/Tarot Images.zip' }],
  },
  {
    slug: 'tarot-alt-images',
    name: 'Tarot Alt Images',
    src: '/files/Tarot Alt Images.zip',
    section: 'Downloads',
    tableau: 'major-alt',
    downloads: [{ label: 'Download ZIP', src: '/files/Tarot Alt Images.zip' }],
  },
  {
    slug: 'tree-of-life',
    name: 'Tree of Life',
    src: '/files/tree-of-life.jpg',
    section: 'Downloads',
  },
  {
    slug: 'tree-of-life-chakras',
    name: 'Tree of Life with Chakras',
    src: '/files/tree-of-life-chakras.jpg',
    section: 'Downloads',
  },
  {
    slug: 'wallpaper',
    name: 'Wallpaper',
    src: '/files/wallpaper.jpg',
    section: 'Downloads',
    rounded: false,
  },
  {
    slug: 'wallpaper-alt',
    name: 'Wallpaper Alt',
    src: '/files/wallpaper-alt.jpg',
    section: 'Downloads',
    rounded: false,
  },
  {
    slug: 'occult-fundamentals',
    name: '1. Occult Fundamentals and Spiritual Unfoldment',
    src: '/files/1. Occult Fundamentals and Spiritual Unfoldment.pdf',
    section: BOOKS_SECTION,
    direct: true,
  },
  {
    slug: 'esoteric-secrets',
    name: '2. Esoteric Secrets of Meditation and Magic',
    src: '/files/2. Esoteric Secrets of Meditation and Magic.pdf',
    section: BOOKS_SECTION,
    direct: true,
  },
  {
    slug: 'wisdom-of-tarot',
    name: '3. Wisdom of Tarot',
    src: '/files/3. Wisdom of Tarot.pdf',
    section: BOOKS_SECTION,
    direct: true,
  },
  {
    slug: 'tarot-revelations',
    name: '4. Tarot Revelations',
    src: '/files/4. Tarot Revelations.pdf',
    section: BOOKS_SECTION,
    direct: true,
  },
  {
    slug: 'hermetic-alchemy',
    name: '5. Hermetic Alchemy',
    src: '/files/5. Hermetic Alchemy.pdf',
    section: BOOKS_SECTION,
    direct: true,
  },
  {
    slug: 'lesser-ritual-of-the-pentagram',
    name: 'Lesser Ritual of the Pentagram',
    src: '/files/lrp.jpg',
    section: 'Historical',
  },
  {
    slug: 'tarot-back',
    name: 'Tarot Back Image',
    src: '/files/tarot-back.jpg',
    section: 'Historical',
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
