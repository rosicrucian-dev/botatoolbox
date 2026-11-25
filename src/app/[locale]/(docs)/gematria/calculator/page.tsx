import { MovedTo } from '@/components/nav/MovedTo'

// The calculator moved up to /gematria when the Gematria group became
// one row of Tools (November 2026) — the tool's own href is its first
// view. `keepQuery` carries `?seq=` across: a shared or saved spelling
// is the likeliest thing to arrive at the old address.
export default function GematriaCalculatorRedirect() {
  return <MovedTo to="/gematria" what="The calculator" keepQuery />
}
