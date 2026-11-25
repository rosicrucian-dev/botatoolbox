// Classes for the link wrapping each Key image on the meditation pages (the
// image itself is `block w-full` inside it; tapping it opens the card's
// /tarot page with its correspondences). Phones get the
// cards filling the article width — one card spans it, two share it with
// the 5% flex gap, three sit at 30% each, four at 21.25% — while from md up every card is
// 30% so sizing matches across all meditation views.
export function meditationCardClass(count: number): string {
  const width =
    count <= 1
      ? 'w-full md:w-[30%]'
      : count === 2
        ? 'w-[47.5%] md:w-[30%]'
        : count === 3
          ? 'w-[30%]'
          : 'w-[21.25%]'
  return `block ${width} shadow-sm ring-1 ring-zinc-200 transition hover:opacity-90 dark:ring-zinc-800`
}
