// How a published transcript body divides into paragraphs — defined ONCE.
//
// The paragraph is the unit of everything the transcript UI does: each one gets
// an audio start time (content/data/recordings-timings.json), is click-to-seek,
// and is what a search result lands on. Its INDEX is the join between all of
// them, so every consumer has to split identically or the audio jumps to the
// wrong place. The rule is one line, which is exactly why it had drifted into
// three copies:
//
//   src/app/[locale]/(docs)/recordings/[group]/[file]/page.tsx   (render)
//   scripts/gen-recordings-timings.ts                            (equality proof)
//   scripts/fix-transcripts.ts                                   (diffing)
//
// Scripts import this by relative path, as they already do for the search
// engine; the app imports it by alias.

export function splitParagraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
}
