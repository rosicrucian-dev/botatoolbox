import { MovedTo } from '@/components/nav/MovedTo'

// A REGROUPING, NOT A RENAME (November 2026). The tables were eight
// rows of the Reference group at /reference/<table>; the Reference is
// now the five things a reader looks up — the Correspondences, the two
// Arcana, the Cube and the Tree — and the tables stand behind
// /correspondences, which is their index (src/lib/tables.ts).

export default function ReferenceNumerologyRedirect() {
  return <MovedTo to="/correspondences/numerology" what="The Numerology table" />
}
