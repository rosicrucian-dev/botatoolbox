import { MovedTo } from '@/components/nav/MovedTo'

// THE PRACTICE GROUP IS GONE (10 November 2026). It held two rows and
// both turned out to be Reference: the Quiz drilled the correspondence
// tables, and the Words of Power are a table of the names with a player
// behind each row. The group named what the reader DOES, and this site
// is cheat sheets and tools — the school is
// hermeticorderofaquarius.org.
export default function PracticeRedirect() {
  return (
    <MovedTo
      to="/reference"
      what="Practice"
      verb="is now part of"
      label="Reference"
    />
  )
}
