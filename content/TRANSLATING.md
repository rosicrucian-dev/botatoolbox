# Translating the BOTA Toolbox

Welcome, and thank you! This guide explains everything you need — no
programming knowledge required, just careful editing in your web
browser on GitHub.

## The one golden rule

**Only change text that is *between* quotation marks on the RIGHT side
of a colon — never the left side, and never anything that looks like a
code word** (`the-magician`, `slug`, file names, `##` heading marks).
The left-hand names are how the website finds each piece of text. If
one changes, that text silently stops appearing.

```json
{
  "the-magician": {              ← never touch this line
    "name": "The Magician",      ← translate ONLY the right-hand part:
    ...                            "name": "Der Magier",
```

Everything is pre-filled with the current English text — so your job is
always: **replace English with German, in place.** If something is not
translated yet, the site simply shows English there. Nothing you leave
for later breaks anything.

## Where the files live

| What | Folder |
|---|---|
| All tables & card data (names, keywords, meanings, meditations…) | `content/data/de/*.json` |
| The long texts (Book of Tokens, Emerald Tablet…) | `content/texts/de/*.md` |
| Rituals | `content/rituals/de/*.md` |
| Menus, buttons, page titles (the site "chrome") | `content/messages/de.json` |

Good starting points, smallest first: `content/data/de/numerology.json`,
`alchemy.json`, `houses.json` — then work up to `tarot.json`,
`minor-arcana.json`, and the meditations (the big ones).

## Editing the `.json` data files

1. Open the file on GitHub and click the **pencil icon** (Edit).
2. Replace the English text in the right-hand quotes with German.
   Leave the quotes themselves, the commas, and the braces exactly as
   they are.
3. A few characters need care inside text: write `\"` for a quotation
   mark inside a sentence, and don't add line breaks inside a quoted
   text (the long paragraphs are one long line — that's normal).
4. When done, click **Commit changes** → choose **"Create a new branch
   and start a pull request"** → **Propose changes**.

The website checks every pull request automatically. If a comma or
quote went missing, the check fails and nothing is harmed — we'll see
the error together and fix it. A typo'd left-hand name never breaks the
site either; that text just shows English until we correct it.

## Editing the `.md` text files

These are the long prose texts. Translate the sentences **in place**,
and keep the *skeleton* of the file identical to the English original:

- Lines starting with `##` are chapter headings — you may translate the
  words after `##`, but never delete a `##` line or add a new one.
- In the **Book of Tokens**, lines that are just a number and a dot
  (`4.`) mark the verses — leave those lines exactly as they are.
- In **rituals**, each step line starts with a label and a dot
  (`i. Face east…`) — translate the sentence, keep the label. Links
  that look like `[Name](/practice/words-of-power/xyz)` — translate
  only the part in `[square brackets]`, never the part in
  `(parentheses)`.
- Blank lines matter (they separate stanzas) — keep them where they are.

## What NOT to translate

- **Proper names & Hebrew**: transliterations like *Kether*,
  *Atziluth*, *Aleph*, mantra names, and Hebrew letters stay as they
  are (translate them only where German BOTA literature has an
  established form — your call as the expert).
- Anything that looks like a web address, a color word used alone
  (these drive the site's color system), zodiac glyphs, numbers.
- `content/data/de/*.schema.json` files — these are generated helpers,
  never edit them.
- The English originals (everything *outside* the `de/` folders) — if
  you spot a mistake in the English, mention it in a pull request
  comment instead of editing it.

## The chrome file (`content/messages/de.json`)

One flat file holds every menu entry, button, page title, and heading.
Same rule as everywhere: translate only the right-hand side. The keys
hint at where each string appears (`nav.…` = the sidebar menu,
`page.…` = page titles and headings, `player.…` = the full-screen
players). This file is a great early win — translating it makes the
whole site *feel* German even before the deep content is done.

## Two useful things to know

- **Some fields are deliberately missing** from the `de/` data files
  (slugs, glyphs, Hebrew letters, color words) — they're structural and
  must stay identical across languages. If a field you expected to
  translate isn't in the file, that's why.
- **When the English text changes** after you've translated something,
  your German stays as it is — it won't be overwritten. We'll flag
  passages that need re-checking when that happens.

Questions or unsure about anything? Open an
[issue](https://github.com/rosicrucian-dev/botatoolbox/issues) or ask
in the pull request — always better to ask than to guess.
