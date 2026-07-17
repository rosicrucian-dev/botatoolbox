// The merged English chrome catalog — single source of truth for every
// static UI string and its message key. Each namespace file holds
// dependency-free literals ONLY (no imports beyond siblings): the
// generator scripts (gen-translations, gen-schemas) import this under
// plain node, where webpack path aliases don't exist.
//
// nav.* keys are NOT here — they derive from src/lib/nav-data.ts
// (navMessageEntries()) so the nav strings aren't written twice.

// .ts extensions: this module is imported by the generator scripts
// under plain node (--experimental-strip-types), whose ESM resolver
// needs explicit extensions. tsconfig sets allowImportingTsExtensions.
import { chrome } from './chrome.ts'
import { components } from './components.ts'
import { pagesContent } from './pages-content.ts'
import { pagesReference } from './pages-reference.ts'
import { player } from './player.ts'
import { quizzes } from './quizzes.ts'

export const en = {
  ...chrome,
  ...quizzes,
  ...components,
  ...pagesContent,
  ...pagesReference,
  ...player,
} as const

export type MessageKey = keyof typeof en
