import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// State mirrored to a URL query param (?key=…) so it survives refresh and
// back-nav and stays shareable. The URL is the source of truth: state seeds
// from it on mount, and every change is pushed back via router.replace (no
// history entry per keystroke — important for keypad-style inputs).
//
// `parse` maps the raw param string to the state value; `serialize` maps it
// back. An empty serialized string removes the param entirely.
export function useQueryParamState<T>(
  key: string,
  parse: (raw: string) => T,
  serialize: (value: T) => string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const router = useRouter()
  const sp = useSearchParams()
  const [value, setValue] = useState<T>(() => parse(sp.get(key) ?? ''))

  useEffect(() => {
    const next = serialize(value)
    if (next === (sp.get(key) ?? '')) return
    const params = new URLSearchParams(sp.toString())
    if (next) params.set(key, next)
    else params.delete(key)
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
    // serialize/parse are assumed stable (defined at module or render top).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, key, router, sp])

  return [value, setValue]
}
