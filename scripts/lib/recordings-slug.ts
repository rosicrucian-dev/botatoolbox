// Shared slug logic for recordings, imported by BOTH gen-recordings.ts (which
// derives the manifest slug + audioPath the site requests) and stage-r2-audio.ts
// (which names the uploaded R2 objects). Keeping it in one place is what
// guarantees the uploaded object keys match what the transcript pages ask for.

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
