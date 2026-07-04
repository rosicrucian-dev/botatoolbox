// Downloadable files shown under /files, grouped by section. Most entries
// have a viewer route at /files/<slug>; entries marked `direct` link
// straight to `src` as a download and have no viewer page.
//
// The assets themselves are NOT in the repo: they live as assets on the
// permanent `downloads` GitHub Release (free, unmetered bandwidth; the
// repo stays small). files.json keeps the canonical `/files/<name>`
// paths; `downloadUrl` maps them to the release at load time. Local
// copies live in local/files/ (gitignored). To add or update an asset:
//   gh release upload downloads local/files/<name> --clobber

import { z } from 'zod'

import filesData from '@content/data/files.json'
import { byKey } from './helpers'
import { FileEntrySchema, FileDownloadSchema } from './schemas'

export type FileEntry = z.infer<typeof FileEntrySchema>
export type FileDownload = z.infer<typeof FileDownloadSchema>

export const DOWNLOADS_RELEASE_URL =
  'https://github.com/rosicrucian-dev/botatoolbox/releases/download/downloads/'

// `/files/<name>` → the release asset URL. Non-/files/ paths (e.g. a
// preview image reused from public/tarot) pass through untouched.
export function downloadUrl(src: string): string {
  return src.startsWith('/files/')
    ? DOWNLOADS_RELEASE_URL + src.slice('/files/'.length)
    : src
}

export const files: ReadonlyArray<FileEntry> = z
  .array(FileEntrySchema)
  .parse(filesData)
  .map((f) => ({
    ...f,
    src: downloadUrl(f.src),
    downloads: f.downloads?.map((d) => ({ ...d, src: downloadUrl(d.src) })),
  }))

export const fileBySlug = byKey(files, 'slug', 'file.slug')

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
