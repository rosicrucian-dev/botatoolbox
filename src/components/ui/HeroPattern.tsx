// The Protocol template's homepage flair: a green wash (#36b49f →
// #DBFF75) masked to fade out toward the top. Hardcoded hex rather than
// `emerald-*` classes, so it stays green despite this project's
// emerald→Apple-blue remap (src/styles/tailwind.css). Mounted only on
// the homepage.
//
// THE GRID IS OFF (10 November 2026, an experiment): Protocol skews a
// 72×56 `GridPattern` across this wash with four of its cells filled,
// and at the top of the page it read as ruled lines rather than as
// texture — the one hard-edged thing on a page of soft ones, and the
// first thing a reader's eye went to. The wash alone is what the colour
// was for. The pattern itself stays in the cards (NavCards), where it
// is small, faint and behind type.
export function HeroPattern() {
  return (
    <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
      <div className="absolute top-0 left-1/2 -ml-152 h-100 w-325 dark:mask-[linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-linear-to-r from-[#36b49f] to-[#DBFF75] mask-[radial-gradient(farthest-side_at_top,white,transparent)] opacity-40 dark:from-[#36b49f]/30 dark:to-[#DBFF75]/30 dark:opacity-100" />
        <svg
          viewBox="0 0 1113 440"
          aria-hidden="true"
          className="absolute top-0 left-1/2 -ml-76 w-278.25 fill-white blur-[26px] dark:hidden"
        >
          <path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
        </svg>
      </div>
    </div>
  )
}
