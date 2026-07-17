// Strings from shared components (src/components/**): search, footer,
// players' controls, prev/next nav, etc. Dependency-free literals.
export const components = {
  'common.previous': 'Previous',
  'common.next': 'Next',

  'search.find': 'Find something...',
  'search.label': 'Search',
  'search.nothingFoundBefore': 'Nothing found for',
  'search.nothingFoundAfter': '. Please try again.',

  'footer.viewSource': 'View source on GitHub',
  'mobileNav.toggle': 'Toggle navigation',
  'lastVisited.continue': 'Continue:',

  'prevNext.label': 'Page navigation',
  'slidePlayer.navLabel': 'Slide navigation',

  'sound.play': 'Play tone',
  'sound.dismiss': 'Dismiss',
  'sound.iosHint':
    "Don't hear anything? Check that Silent Mode and Do Not Disturb are both off.",
} as const
