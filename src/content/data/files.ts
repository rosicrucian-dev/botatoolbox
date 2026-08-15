// Downloadable files shown under /files, grouped by section. Most entries
// have a viewer route at /files/<slug>; entries marked `direct` link
// straight to `src` as a download and have no viewer page.
//
// The assets themselves are NOT in the repo: they live on Cloudflare R2,
// served via cdn.botatoolbox.org (free egress, real CDN; the repo stays
// small). files.json keeps the canonical `/files/<name>` paths;
// `downloadUrl` maps them to the CDN base at load time. Local copies live
// in local/files/ (gitignored). To add or update an asset:
//   rclone copy local/files rosicruciandev:botatoolbox/files
//
// German display fields come from `de/files.json` via getFiles(locale);
// the top-level exports stay pinned to English for legacy consumers.

import { z } from 'zod'

import filesData from '@content/data/en/files.json'
import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { FileDownloadSchema, FileEntrySchema } from './schemas'

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

export const getFiles = defineLocalized((locale) => {
  const files: ReadonlyArray<FileEntry> = z
    .array(FileEntrySchema)
    .parse(rawFor(locale))
    .map((f) => ({
      ...f,
      src: downloadUrl(f.src),
      downloads: f.downloads?.map((d) => ({ ...d, src: downloadUrl(d.src) })),
    }))

  const fileBySlug = byKey(files, 'slug', 'file.slug')

  // Stable section ordering for the index page (insertion order of first
  // occurrence in `files`).
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

  return { files, fileBySlug, sectionsInOrder }
})
