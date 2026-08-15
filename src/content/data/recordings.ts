// Ann Davies recordings manifest. GENERATED into content/data/recordings.json
// by scripts/gen-recordings.ts (npm run gen:recordings); the transcript bodies
// live in content/recordings/en/<slug>.md. English-only — a single top-level
// data file (no locale overlay), so this parses the JSON directly rather than
// going through localizedRaw. The /recordings routes read the matching .md at
// build via readLocalizedMarkdown('recordings', …).

import { z } from 'zod'

import recordingsData from '@content/data/recordings.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { RecordingSchema } from './schemas'

export type Recording = z.infer<typeof RecordingSchema>

export interface RecordingGrouping {
  slug: string
  title: string
  count: number
}

export const getRecordings = defineLocalized(() => {
  const recordings: ReadonlyArray<Recording> = z
    .array(RecordingSchema)
    .parse(recordingsData)

  const recordingBySlug = byKey(recordings, 'slug', 'recording.slug')

  // Groupings in first-seen order (mirror files.ts sectionsInOrder), each with
  // its display title and recording count for the landing cards.
  const groupingsInOrder: ReadonlyArray<RecordingGrouping> = (() => {
    const seen = new Map<string, RecordingGrouping & { count: number }>()
    const out: Array<RecordingGrouping & { count: number }> = []
    for (const r of recordings) {
      let g = seen.get(r.groupingSlug)
      if (!g) {
        g = { slug: r.groupingSlug, title: r.grouping, count: 0 }
        seen.set(r.groupingSlug, g)
        out.push(g)
      }
      g.count++
    }
    return out
  })()

  return { recordings, recordingBySlug, groupingsInOrder }
})
