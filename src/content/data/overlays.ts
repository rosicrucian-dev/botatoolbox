// Central registry of TRANSLATED-locale data files — THE one place that
// imports them (webpack needs static import paths, so they can't be
// looped; keeping them all here means adding a locale touches this
// file once instead of every loader). Keyed to match overlay-config.ts;
// loaders import their own English master (content/data/en/<file>.json)
// and reach the translations through localizedRaw() in overlay.ts.
// Translated files are FULL sibling copies of the English file; the
// merge takes only the whitelisted display fields from them.
//
// The Record<TranslationLocale, …> typing is deliberate: adding a
// locale to LOCALES makes tsc flag every missing entry below. Run
// `npm run gen:translations` first so the files exist to import.

import { type TranslationLocale } from '@/lib/locales'

import deAlchemy from '@content/data/de/alchemy.json'
import deChakras from '@content/data/de/chakras.json'
import deElements from '@content/data/de/elements.json'
import deFiles from '@content/data/de/files.json'
import deFourWorlds from '@content/data/de/four-worlds.json'
import deGrades from '@content/data/de/grades.json'
import deGunas from '@content/data/de/gunas.json'
import deHouses from '@content/data/de/houses.json'
import deSupersensory from '@content/data/de/meditations-supersensory-powers.json'
import deTarotFundamentals from '@content/data/de/meditations-tarot-fundamentals.json'
import deMinorArcana from '@content/data/de/minor-arcana.json'
import deNumerology from '@content/data/de/numerology.json'
import dePillars from '@content/data/de/pillars.json'
import dePlanets from '@content/data/de/planets.json'
import deRituals from '@content/data/de/rituals.json'
import deSephiroth from '@content/data/de/sephiroth.json'
import deSigns from '@content/data/de/signs.json'
import deSuitCorrespondences from '@content/data/de/suit-correspondences.json'
import deTarot from '@content/data/de/tarot.json'
import deTenPalaces from '@content/data/de/ten-palaces.json'
import deTexts from '@content/data/de/texts.json'
import deThreeVeils from '@content/data/de/three-veils.json'
import deWords from '@content/data/de/words.json'

export const overlays: Record<string, Record<TranslationLocale, unknown>> = {
  alchemy: { de: deAlchemy },
  chakras: { de: deChakras },
  elements: { de: deElements },
  files: { de: deFiles },
  'four-worlds': { de: deFourWorlds },
  grades: { de: deGrades },
  gunas: { de: deGunas },
  houses: { de: deHouses },
  'meditations-supersensory-powers': { de: deSupersensory },
  'meditations-tarot-fundamentals': { de: deTarotFundamentals },
  'minor-arcana': { de: deMinorArcana },
  numerology: { de: deNumerology },
  pillars: { de: dePillars },
  planets: { de: dePlanets },
  rituals: { de: deRituals },
  sephiroth: { de: deSephiroth },
  signs: { de: deSigns },
  'suit-correspondences': { de: deSuitCorrespondences },
  tarot: { de: deTarot },
  'ten-palaces': { de: deTenPalaces },
  texts: { de: deTexts },
  'three-veils': { de: deThreeVeils },
  words: { de: deWords },
}
