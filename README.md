# Digital Footprint X-Ray (TEAM BYTEZZ)
VBYLD 2027 Hack for Social Cause. Theme: **Digital Safety & Cyber Fraud Awareness**. A consent-based privacy self-audit for your own JPEG photo and public bio, processed entirely in the browser.
Team: TEAM BYTEZZ | State: Andhra Pradesh | College: [College] | [Team details to be completed]

## Setup and run
No install. Open `index.html` in a modern browser (Chrome, Edge, Firefox). No backend, account, CDN or network use; a content-security policy blocks connections.
Tests (Node 18+): `node tests/core.test.js`

## Demo
1. Click **Reveal the story** for the fictional clue constellation.
2. Click **Load synthetic sample**: scans an in-browser JPEG with invented metadata and a fictional bio. Then click **Make and verify clean copy**.
3. To test your own content: tick consent (needed before every scan), choose a JPEG or paste your bio, scan.

## 3D constellation
The fictional clue constellation is a real-time 3D scene (perspective projection on a plain Canvas, drag or arrow keys to rotate). No 3D library, CDN or WebGL is used. Reduced-motion users get a static scene.

## What it checks
Photo (JPEG/JPG only): presence of GPS tags (coordinates never read or shown), capture time, device make/model. Bio: simple email, phone and possible-address patterns (matched values never shown or stored). The score is an illustrative indicator: 100 minus clue weights (location 30, time 10, device 10, email 15, phone 15, address 15). Higher = fewer supported clues. Not a validated rating.

## Boundaries
Own or authorized content only. No internet search, scraping, accounts, passwords, OTPs, uploads, analytics, telemetry or storage. It does not prevent fraud or identify anyone. Impact is unmeasured (see docs/DECK_NOTES.md for proposed measures).

## Files
`index.html`, `styles.css`, `app.js` (UI) | `core.js` (EXIF presence parser, bio patterns, score) | `tests/` | `sample-data/` | `ARCHITECTURE.md` | `KNOWN_LIMITATIONS.md` | `AI_DISCLOSURE.md` | `docs/` (incl. `DESIGN_BLUEPRINT.html` wireframes + `DESIGN_NOTES.md`)
License: MIT (code written for this project; no third-party code or assets; system fonts only). Confirm the copyright holder name in `LICENSE`.

## Environment variables
None. The app has no backend, no API keys and no configuration. Nothing to set.

## Requirements
Any modern browser to run. Node.js 18+ only if you want to run the unit tests (no packages to install, no `npm install`).

## Deploy (optional)
It is a static site. Enable GitHub Pages (Settings > Pages > Deploy from branch > main > root) to get a free live demo link. Live link: [add after enabling]
