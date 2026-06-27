# Vendored build inputs

## `sepher-sephiroth.source.json`

A number-indexed dictionary of Hebrew words from Aleister Crowley's
**Sepher Sephiroth** (first published 1909 in *The Equinox* I(8); also in
*777 and Other Qabalistic Writings*). The underlying text is **public
domain**.

This particular JSON serialization was produced by the
[alanwillms/sepher-sephiroth](https://github.com/alanwillms/sepher-sephiroth)
parser. We vendor it only as a **build input** — `scripts/build-gematria-words.ts`
transforms it into our own derived dataset at
`content/data/generated/gematria-words.json` (recomputing every value with this
app's gematria scheme, re-bucketing, and cleaning the Hebrew). The shipped
artifact is the derived file, not this source.

## `strongs-hebrew.source.json`

James Strong's *A Concise Dictionary of the Words in the Hebrew Bible*
(1894, public domain), in the JSON serialization from
[openscriptures/strongs](https://github.com/openscriptures/strongs)
(**CC-BY-SA**, © Open Scriptures). 8,674 lemmas with definitions. The
build matches these to the Sepher Sephiroth words by consonantal spelling
to fill in a plain definition where Crowley's gloss is terse or absent.

> Attribution note: because this input is CC-BY-SA, the gematria
> dictionary it feeds is a derivative — credit Open Scriptures / Strong's
> wherever the data is surfaced (e.g. an About/credits line).

## Regenerate

Both inputs feed one build:

```
npm run gen:gematria-words
```
