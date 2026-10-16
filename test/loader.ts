// Registers the resolver hook below for `npm test`, so tests can import
// application modules that use the tsconfig path aliases (`@/…`,
// `@content/…`) and bare JSON imports — both of which webpack resolves for
// the app but plain Node does not. Wired via `node --import ./test/loader.ts`.
import { register } from 'node:module'

register('./hooks.ts', import.meta.url)
