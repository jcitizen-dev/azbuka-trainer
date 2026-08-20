# Azbuka & Padeži

A Serbian trainer that installs to a phone home screen and runs offline.
Three tabs:

- **Ћирилица** — the thirty Cyrillic letters, adaptive drills, real-word reading, a 60-second fluency sprint.
- **Падежи** — Padež Challenge across five difficulty levels, a conversational tutor, and compact case charts.
- **Vocab** — a three-answer meaning quiz and a searchable word list with full declensions.

## Files

| file | what it is |
| --- | --- |
| `index.html` | markup and app shell only |
| `style.css` | all styling, light and dark |
| `vocab.js` | the vocabulary database — **edit this to add words** |
| `game.js` | case game, vocab quiz, tutor, progress, navigation |
| `azbuka.js` | the Cyrillic alphabet trainer |
| `sw.js` | service worker; caches the app shell for offline use |

### Adding vocabulary

Append an object to the `VOCAB` array in `vocab.js`. Nouns need `cases` with all
seven forms written out — a case value may be an array when Serbian allows more
than one form, and the app will accept any of them:

```js
{ word:"kuća", type:"noun", en:"house", gender:"feminine", animacy:"inanimate",
  number:"singular", tags:["place"], practice:true,
  cases:{ nominative:"kuća", genitive:"kuće", dative:"kući", accusative:"kuću",
          vocative:"kućo", instrumental:"kućom", locative:"kući" } }
```

Nothing else needs to change: questions, the word list and the review system all
generate from that array.

`tools/build_vocab.py` is how the current file was generated — declension classes
plus hand-written overrides for every irregular. It is optional; `vocab.js` is
the file the app actually reads.

### Other tools

- `tools/build_artifact.py` — flattens everything into `build/artifact.html` (single-file copy).
- `tools/devserve.py` — local server that disables caching, for testing.

## Install on iPhone

Open the site in Safari → Share → **Add to Home Screen**.

Progress is stored in `localStorage` on the device. Nothing is sent anywhere.

## Bump the cache after changing app files

Edit `VERSION` in `sw.js` (e.g. `azbuka-v2` → `v3`), or installed copies keep
serving the cached shell.
