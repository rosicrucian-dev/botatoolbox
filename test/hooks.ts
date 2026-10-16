// Module-resolution hook for `npm test` (see loader.ts). Three jobs:
//   1. Map the tsconfig aliases `@/`, `@private/`, and `@content/`.
//   2. Resolve extensionless relative/aliased imports to `.ts` (or
//      `/index.ts`), which the app's bundler does and Node's ESM loader
//      does not.
//   3. Mark `.json` imports with `type: 'json'`, which Node requires as an
//      import attribute but the bundler infers.
// Anything else falls straight through to Node's own resolver.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../', import.meta.url)
const ALIASES: ReadonlyArray<readonly [string, string]> = [
  ['@private/', 'private/legacy/src/'],
  ['@content/', 'content/'],
  ['@/', 'src/'],
]

interface ResolveContext {
  parentURL?: string
}
interface Resolved {
  url: string
  format?: string | null
  importAttributes?: Record<string, string>
  shortCircuit?: boolean
}
type NextResolve = (
  specifier: string,
  context: ResolveContext,
) => Promise<Resolved>

export async function resolve(
  specifier: string,
  context: ResolveContext,
  nextResolve: NextResolve,
): Promise<Resolved> {
  let spec = specifier
  for (const [prefix, dir] of ALIASES) {
    if (spec.startsWith(prefix)) {
      spec = new URL(dir + spec.slice(prefix.length), ROOT).href
      break
    }
  }

  const isPathLike =
    spec.startsWith('file:') || spec.startsWith('./') || spec.startsWith('../')
  if (isPathLike && !/\.[a-z]+$/i.test(spec)) {
    const base = spec.startsWith('file:')
      ? spec
      : new URL(spec, context.parentURL).href
    for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
      if (existsSync(fileURLToPath(candidate))) {
        spec = candidate
        break
      }
    }
  }

  const resolved = await nextResolve(spec, context)
  if (resolved.url.endsWith('.json')) {
    return { ...resolved, importAttributes: { type: 'json' } }
  }
  return resolved
}
