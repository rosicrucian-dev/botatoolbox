import { GematriaNumberRow } from './GematriaNumberRow'
import { SourceTitle, SubSection } from './GematriaHeadings'

// A number-keyed 'note' source (Paul Case's dictionaries): the source title,
// then a "Number N" sub-section holding the prose for this number. Long entries
// (the Gematria Notebook) collapse behind "Show more".
export function GematriaNoteSection({
  label,
  text,
  number,
}: {
  label: string
  text: string
  number: number
}) {
  return (
    <section>
      <SourceTitle>{label}</SourceTitle>
      <div className="mt-3">
        <SubSection title={`Number ${number}`}>
          <GematriaNumberRow text={text} collapsible />
        </SubSection>
      </div>
    </section>
  )
}
