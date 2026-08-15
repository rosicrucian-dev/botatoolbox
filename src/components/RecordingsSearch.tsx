'use client'

// The Recordings page's toolbar Search action — a thin binding of the shared
// CollectionSearch to the recordings transcript index. The engine, dialog, and
// lazy-mount all live in CollectionSearch/CollectionSearchDialog; this only
// supplies the index URL and copy. English-only: the transcript index ships a
// single /data/recordings-search.json (no per-locale overlay yet).

import { CollectionSearch } from '@/components/CollectionSearch'

export function RecordingsSearch() {
  return (
    <CollectionSearch
      indexUrl="/data/recordings-search.json"
      placeholder="Search transcripts…"
      nounPlural="transcripts"
    />
  )
}
