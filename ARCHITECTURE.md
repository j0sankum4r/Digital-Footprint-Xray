# Architecture
index.html (UI + CSP) -> app.js (events, rendering, clean-copy flow) -> core.js (pure functions: parseExif, scanBio, score, synthetic sample builder). scene3d.js = fictional 3D constellation (Canvas 2D perspective projection, no libraries) and hero tilt. styles.css = visual system.
Local data flow: selected file or pasted text -> memory in this tab -> findings rendered in DOM. Clean copy: file -> createImageBitmap -> canvas -> new JPEG blob -> re-parsed by core.js -> download link. Nothing is uploaded, logged or persisted. Reloading clears all state.
Tests: tests/core.test.js covers the parser (GPS/time/device presence), bio patterns and score ordering using synthetic data only.
