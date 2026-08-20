# Azbuka Trainer

A single-page web app for learning to read Serbian Cyrillic: all thirty letters
grouped by what they cost you, adaptive drills, real-word reading, and a timed
fluency sprint. Installs to an iPhone home screen and runs offline.

- `index.html` — the whole app (no build step, no dependencies)
- `sw.js` — service worker, caches the app shell for offline use
- `manifest.webmanifest` — PWA metadata

Progress is stored in `localStorage` on the device. Nothing is sent anywhere.

## Install on iPhone

Open the site in Safari → Share → **Add to Home Screen**.
