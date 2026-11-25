import { MovedTo } from '@/components/nav/MovedTo'

// THE QUIZ IS RETIRED HERE (10 November 2026). It was 25 quizzes in
// five categories — Major Arcana, Minor Arcana, Hebrew, Signs, and a
// Miscellaneous of one — and every one of them drilled a correspondence
// table. The school site carries the same set and more, built from each
// table's own data and reached from the table itself, so keeping a
// second copy here meant two places to fix a fact.
//
// This site is cheat sheets and tools; being drilled on them is the
// school's work. The stub stands because this address was public and
// crawled, and it points at the tables the quiz asked about rather than
// claiming the quiz moved somewhere a reader could follow — a redirect
// to the school is a decision still to be made.
export default function QuizRetiredRedirect() {
  return (
    <MovedTo
      to="/reference"
      what="The quiz"
      verb="is gone; the tables it asked about are under"
      label="Reference"
    />
  )
}
