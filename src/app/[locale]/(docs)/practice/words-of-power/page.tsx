import { MovedTo } from '@/components/nav/MovedTo'

// The Words of Power left the Practice group for the Reference, where
// the table they are belongs (src/lib/navData.ts), and took their
// top-level address with them.
export default function WordsOfPowerRedirect() {
  return <MovedTo to="/words-of-power" what="The Words of Power" />
}
