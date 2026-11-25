// Deterministic transcript cleanups (Bucket A), shared so the transcript fixer
// and the timings derivation apply IDENTICAL transforms — keeping the corrected
// .md byte-consistent with what the timings check derives from the .json.
//
//   - glossary normalize: whole-word find/replace, first-letter case preserved
//     (a faithful port of local/transcription-pilot/batch.py's normalize()).
//   - capitalize: sentence-case that Whisper often misses.
//
// Both preserve word/paragraph structure (only case + specific terms change),
// so per-paragraph audio timings stay valid.

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Build a glossary normalizer from a { source: target } map. */
export function buildNormalize(map: Record<string, string>): (t: string) => string {
  const re = new RegExp(
    '\\b(' +
      Object.keys(map)
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join('|') +
      ')\\b',
    'gi',
  )
  return (text) =>
    text.replace(re, (m) => {
      const tgt = map[m.toLowerCase()]
      return /[A-Z]/.test(m[0]) ? tgt[0].toUpperCase() + tgt.slice(1) : tgt
    })
}

// Lower-cased words that end in "." mid-sentence — a following word should NOT
// be capitalized after them. (Titles like Mr./Dr. are deliberately absent: the
// name after them SHOULD be capitalized.)
const ABBREV = new Set([
  'etc',
  'e.g',
  'i.e',
  'vs',
  'cf',
  'al',
  'viz',
  'a.m',
  'p.m',
  'p.s',
])

/**
 * Sentence-case a paragraph: capitalize the first letter of the paragraph and
 * the first letter after sentence-ending punctuation, and fix standalone "i".
 *
 * Conservative by design — the word before a terminal .?! must end in a
 * *lowercase* letter (skips acronyms like USA., initials R. V. Ch., ellipses …,
 * decimals 3.14), and known mid-sentence abbreviations (etc., a.m., …) are
 * exempt so their continuation isn't wrongly capitalized.
 */
export function capitalize(text: string): string {
  return text
    .replace(/^(["'([]?\s*)([a-z])/, (_, pre, c) => pre + c.toUpperCase())
    .replace(
      /((\b[A-Za-z][A-Za-z.']*[a-z])[.!?]["')\]]?\s+)([a-z])/g,
      (whole, pre, word, c) =>
        ABBREV.has(word.toLowerCase()) ? whole : pre + c.toUpperCase(),
    )
    .replace(/\bi\b/g, 'I')
}

/** Apply all Bucket-A cleanups to one paragraph of prose. */
export function cleanParagraph(
  text: string,
  normalize: (t: string) => string,
): string {
  return capitalize(normalize(text))
}
