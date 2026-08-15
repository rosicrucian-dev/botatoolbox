// The ephemeris engine contract. Everything above this line (the UI) depends
// only on `AstroEngine` and the `Chart` it returns — never on a specific
// ephemeris library. `getEngine()` is the single seam where the concrete
// implementation is chosen, so swapping astronomy-engine for Swiss Ephemeris
// WASM later is a one-line change here and nothing else.

import { astronomyEngine } from './astronomy-engine'
import type { Chart } from './types'

export interface AstroEngine {
  /**
   * Compute geocentric tropical positions for all bodies at `date`.
   * Async because a future Swiss-Ephemeris WASM backend lazily initialises
   * (and may fetch ephemeris files); the current implementation is synchronous
   * under the hood and resolves immediately.
   */
  computeChart(date: Date): Promise<Chart>
}

export function getEngine(): AstroEngine {
  return astronomyEngine
}
