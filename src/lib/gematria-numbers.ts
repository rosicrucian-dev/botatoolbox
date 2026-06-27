// The two number-only gematria transforms shown above the word list:
// Paul Case's theosophic extension and reduction. Both take a bare number
// and need no knowledge of a specific word.

// The Nth triangular number, 1 + 2 + … + n.
export function theosophicExtension(n: number): number {
  return (n * (n + 1)) / 2
}

// Successive digit-sums down to a single figure (digital root).
export function theosophicReduction(n: number): number {
  let cur = n
  while (cur > 9) {
    cur = String(cur)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0)
  }
  return cur
}
