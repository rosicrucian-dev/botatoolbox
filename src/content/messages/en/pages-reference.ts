// Strings from the reference/tool-side (docs) pages: reference/*,
// gematria, astrology, devices, resources, utilities, website —
// metadata titles, breadcrumb labels, page headings/intros, settings
// labels. Dependency-free literals.
export const pagesReference = {
  // Metadata titles that don't mirror a nav entry (localizedTitle()
  // falls back to `title.<English>` keys for these).
  'title.Astrology Chart': 'Astrology Chart',

  // Settings page
  'settings.style': 'Style',
  'settings.majorArcana': 'Major Arcana',
  'settings.minorArcana': 'Minor Arcana',
  'settings.colors': 'Colors',
  'settings.language': 'Language',
  'settings.permalink': 'Permalink',
  'settings.permalinkHelp':
    'A permanent link to the homepage that applies the settings above automatically, including pinned pages on the homepage.',
  'settings.copy': 'Copy',
  'settings.copied': 'Copied ✓',
  'settings.copyFailed': 'Copying failed — select the link manually:',
  'settings.membersOnly': 'Members Only',
  'settings.membersUnlocked': 'Members only content has been unlocked.',
  'settings.membersHelp': 'Enter the password to unlock all available content.',
  'settings.incorrectPassword': 'Incorrect password.',
  'settings.unlock': 'Unlock',
  'settings.lock': 'Lock',
} as const
