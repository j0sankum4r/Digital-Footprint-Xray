# Known limitations
- JPEG/JPG only. Checks GPS-tag presence, capture time, make, model. XMP, IPTC, thumbnails, maker notes are not checked.
- Clean copy is re-encoded via canvas: quality changes, orientation is baked in. Only the listed fields are verified; no claim of complete removal.
- Bio rules are simple regexes (English address words, 10-13 digit phones): expect misses and false alarms.
- Score weights are illustrative, not validated.
- Prototype tested in headless Chromium with synthetic data; not yet tested on real phone photos or many devices.
- Single language (English). Vernacular support is future work.
