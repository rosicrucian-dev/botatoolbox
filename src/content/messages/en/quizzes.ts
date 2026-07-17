// Quiz display strings. The quiz catalog itself lives in
// src/content/data/quizzes.ts (code, not JSON); its titles/fieldLabels
// look up these keys via tDyn() with the code string as fallback — so a
// new quiz works untranslated until its keys are added here. fieldLabel
// keys exist only where the label differs from the title; otherwise the
// title key covers both. Dependency-free literals.
export const quizzes = {
  'quiz.category.major-arcana': 'Major Arcana',
  'quiz.category.minor-arcana': 'Minor Arcana',
  'quiz.category.signs': 'Signs',
  'quiz.category.hebrew': 'Hebrew',
  'quiz.category.miscellaneous': 'Miscellaneous',

  'quiz.major-arcana.letter.title': 'Letter',
  'quiz.major-arcana.letter-significance.title': 'Letter Significance',
  'quiz.major-arcana.astrology.title': 'Astrology',
  'quiz.major-arcana.alchemy.title': 'Alchemy',
  'quiz.major-arcana.intelligence.title': 'Intelligence',
  'quiz.major-arcana.power.title': 'Power',
  'quiz.major-arcana.human-faculty.title': 'Human Faculty and Opposites',

  'quiz.hebrew.letter.title': 'Letter',
  'quiz.hebrew.transliteration.title': 'Transliteration',
  'quiz.hebrew.gematria.title': 'Gematria',
  'quiz.hebrew.type.title': 'Type',

  'quiz.minor-arcana.wand-keywords.title': 'Wand Keywords',
  'quiz.minor-arcana.cup-keywords.title': 'Cup Keywords',
  'quiz.minor-arcana.sword-keywords.title': 'Sword Keywords',
  'quiz.minor-arcana.pentacle-keywords.title': 'Pentacle Keywords',
  'quiz.minor-arcana.all-keywords.title': 'All Keywords',
  'quiz.minor-arcana.wand-keywords.fieldLabel': 'Keyword',
  'quiz.minor-arcana.cup-keywords.fieldLabel': 'Keyword',
  'quiz.minor-arcana.sword-keywords.fieldLabel': 'Keyword',
  'quiz.minor-arcana.pentacle-keywords.fieldLabel': 'Keyword',
  'quiz.minor-arcana.all-keywords.fieldLabel': 'Keyword',

  'quiz.signs.symbol.title': 'Symbol',
  'quiz.signs.symbol.fieldLabel': 'Sign',
  'quiz.signs.ruler.title': 'Ruler',
  'quiz.signs.exaltation.title': 'Exaltation',
  'quiz.signs.body.title': 'Body',
  'quiz.signs.quality.title': 'Quality',
  'quiz.signs.opposites.title': 'Opposites',
  'quiz.signs.opposites.fieldLabel': 'Opposite',
  'quiz.signs.alchemy-element.title': 'Alchemy - Element',
  'quiz.signs.alchemy-element.fieldLabel': 'Element',
  'quiz.signs.alchemy-stage.title': 'Alchemy - Stage',
  'quiz.signs.alchemy-stage.fieldLabel': 'Stage',

  'quiz.miscellaneous.numerology.title': 'Numerology',
  'quiz.miscellaneous.numerology.fieldLabel': 'Meaning',
} as const
