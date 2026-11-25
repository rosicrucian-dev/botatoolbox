// Downloadable files, grouped by section. Most entries have a viewer
// route at /files/<slug>; entries marked `direct` link straight to `src`
// and have no viewer page.
//
// ONE FILE, TWO SHELVES (25 November 2026). files.json's "Historical"
// section is the ARCHIVE: it is listed at /archive, a row of the Library,
// and no longer on /files, which keeps the site's own downloads. The rows
// stay in files.json, because which page shows a row is this site's
// arrangement and not a fact about the file. `getFiles` hands them out as
// two lists: `files` (/files) and `archive` (/archive). Every archive
// row is `direct`: the Archive has no viewer route, and lists its rows
// by what the file is, PDFs and then images (`isPdf`).
//
// The assets themselves are NOT in the repo: they live on Cloudflare R2,
// served via cdn.botatoolbox.org (free egress, real CDN; the repo stays
// small). files.json keeps the canonical `/files/<name>` paths;
// `downloadUrl` maps them to the CDN base at load time. Local copies live
// in local/files/ (gitignored). To add or update an asset:
//   rclone copy local/files rosicruciandev:botatoolbox/files
//
// German display fields come from `de/files.json` via getFiles(locale).

import { z } from 'zod'

import filesData from '@content/data/en/files.json'
import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { FileDownloadSchema, FileEntrySchema } from '@content/data/schemas'

export type FileEntry = z.infer<typeof FileEntrySchema>
export type FileDownload = z.infer<typeof FileDownloadSchema>

// Base URL for the R2-hosted file assets, overridable via
// NEXT_PUBLIC_FILES_BASE (same pattern as recordingAudioUrl). Default is the
// production CDN.
export const FILES_BASE_URL =
  process.env.NEXT_PUBLIC_FILES_BASE ?? 'https://cdn.botatoolbox.org/files/'

// `/files/<name>` → the CDN asset URL. Non-/files/ paths (e.g. a preview
// image reused from public/tarot) pass through untouched.
export function downloadUrl(src: string): string {
  return src.startsWith('/files/')
    ? FILES_BASE_URL + src.slice('/files/'.length)
    : src
}

const rawFor = localizedRaw('files', filesData)

// The section of files.json that is shown at /archive instead of /files.
export const ARCHIVE_SECTION = 'Historical'

// WHICH rows those are is structure, so it is read from the English
// master and kept by slug: `section` is a display field, which a
// translation replaces (overlay-config.ts), and a German "Historisch"
// compared with the name above would empty /de/archive.
const archiveSlugs: ReadonlySet<string> = new Set(
  filesData.filter((f) => f.section === ARCHIVE_SECTION).map((f) => f.slug),
)

function inArchive(file: FileEntry): boolean {
  return archiveSlugs.has(file.slug)
}

// What a `direct` entry links to, by its extension. Derived, not a
// column: the file name already says it.
export function isPdf(file: FileEntry): boolean {
  return /\.pdf$/i.test(file.src)
}

export const getFiles = defineLocalized((locale) => {
  const all: ReadonlyArray<FileEntry> = z
    .array(FileEntrySchema)
    .parse(rawFor(locale))
    .map((f) => ({
      ...f,
      src: downloadUrl(f.src),
      downloads: f.downloads?.map((d) => ({ ...d, src: downloadUrl(d.src) })),
    }))

  // Keyed across BOTH shelves: they share one file, so a slug is unique
  // over the two.
  const fileBySlug = byKey(all, 'slug', 'file.slug')

  const archive = all.filter(inArchive)
  const files = all.filter((f) => !inArchive(f))

  // Stable section ordering for the /files index (insertion order of
  // first occurrence in `files`).
  const sectionsInOrder: ReadonlyArray<string> = (() => {
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

  return { files, archive, fileBySlug, sectionsInOrder }
})
