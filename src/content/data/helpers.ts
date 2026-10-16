// Tiny helpers shared by the typed data layer. Imported as
// `@/content/data/helpers` — does not appear in the public re-export
// surface so consumers go through index.ts.

// Build an O(1) lookup map from an array. Duplicate keys throw with the
// supplied label so problems surface at module load rather than
// silently dropping a record at runtime. Use this instead of an inline
// `Object.fromEntries(arr.map(...))`.
export function byKey<T, K extends keyof T>(
  arr: ReadonlyArray<T>,
  key: K,
  describe: string,
): Record<string, T> {
  const out: Record<string, T> = {}
  for (const item of arr) {
    const k = String(item[key])
    if (k in out) {
      throw new Error(`${describe}: duplicate key "${k}"`)
    }
    out[k] = item
  }
  return out
}
