// The detail-page table pattern: labeled rows (term + description) used
// by tarot, planet, sign, sephirah, etc. Replaces the open-coded <table>
// + boilerplate row markup that several pages were duplicating.

export interface DefinitionRow {
  label: string
  value: React.ReactNode
}

export function DefinitionList({
  rows,
}: {
  rows: ReadonlyArray<DefinitionRow>
}) {
  return (
    <table className="w-full text-left">
      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {rows.map((row, i) => (
          <tr key={i}>
            <th
              scope="row"
              className="w-1/3 py-2 pr-4 text-sm font-medium text-zinc-500 dark:text-zinc-400"
            >
              {row.label}
            </th>
            <td className="py-2 text-sm text-zinc-900 dark:text-zinc-100">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
