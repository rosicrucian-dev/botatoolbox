// Build public/data/book-of-tokens-search.<locale>.json — the Book-of-Tokens
// full-text search index (word → [chapterIdx, count, …]), one file per locale.
//
//   npm run gen:search:bot
//
// Reads each locale's meditation source (content/texts/<locale>/
// book-of-tokens.md), parses it into chapters with the SAME parser the pages
// use (src/content/texts/book-of-tokens-parse), and builds the index with the
// shared buildInvertedIndex helper. One "track" per letter (Aleph, Beth, …):
// the whole meditation's verse text is indexed, and a result opens that
// letter's page with the matched words highlighted (#q=…).
//
// URL slugs ALWAYS come from the English parse — translated chapters pair up
// by position, so /texts/book-of-tokens/<slug> is identical across locales
// (matching book-of-tokens.ts and the [chapter] route's generateStaticParams).
//
// Run under node --experimental-strip-types (relative imports; no @ aliases).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { CollectionSearchIndexSchema } from '../src/content/data/schemas.ts'
import {
  parse,
  type Chapter,
} from '../src/content/texts/book-of-tokens-parse.ts'
import type { SearchTrack } from '../src/lib/collection-search.ts'
import { DEFAULT_LOCALE, LOCALES } from '../src/lib/locales.ts'
import {
  buildInvertedIndex,
  type IndexItem,
} from './lib/build-search-index.ts'

const ROOT = resolve(import.meta.dirname, '..')
const sourcePath = (locale: string) =>
  join(ROOT, `content/texts/${locale}/book-of-tokens.md`)
const outPath = (locale: string) =>
  join(ROOT, `public/data/book-of-tokens-search.${locale}.json`)

/** Flatten a chapter's verses to one searchable string (title + all lines). */
function chapterText(c: Chapter): string {
  const lines = c.verses.flatMap((v) => v.stanzas.flat())
  return `${c.title} ${lines.join(' ')}`
}

// Slugs (and chapter count) come from the English parse — the structural
// source of truth for every locale's routes.
const enChapters = parse(readFileSync(sourcePath(DEFAULT_LOCALE), 'utf8'))

for (const locale of LOCALES) {
  let chapters = enChapters
  if (locale !== DEFAULT_LOCALE) {
    const parsed = parse(readFileSync(sourcePath(locale), 'utf8'))
    if (parsed.length === enChapters.length) {
      chapters = parsed
    } else {
      console.warn(
        `[i18n] book-of-tokens (${locale}): ${parsed.length} chapters vs ` +
          `${enChapters.length} in English — structure must match; ` +
          `indexing English text`,
      )
    }
  }

  const items: IndexItem[] = chapters.map((c, i) => {
    const slug = enChapters[i].slug // URL slug is always English
    const track: SearchTrack = {
      id: slug,
      title: c.title,
      href: `/texts/book-of-tokens/${slug}`,
    }
    return { track, text: chapterText(c) }
  })

  const index = buildInvertedIndex(items)
  CollectionSearchIndexSchema.parse(index)

  const out = outPath(locale)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(index))

  const bytes = readFileSync(out).length
  console.log(
    `Wrote search index: ${index.tracks.length} meditations (${locale}), ` +
      `${Object.keys(index.words).length} unique words, ` +
      `${(bytes / 1024).toFixed(0)} KB → ${out.replace(ROOT + '/', '')}`,
  )
}
