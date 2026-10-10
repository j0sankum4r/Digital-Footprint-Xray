/* Digital Footprint X-Ray core. Pure functions, no network, no storage. */
(function (root) {
  const W = { gps: 30, captureTime: 10, device: 10, email: 15, phone: 15, address: 15 };

  function parseExif(u8) {
    const r = { isJpeg: false, gps: false, captureTime: false, make: false, model: false };
    if (!u8 || u8.length < 4 || u8[0] !== 0xFF || u8[1] !== 0xD8) return r;
    r.isJpeg = true;
    let p = 2;
    while (p + 4 <= u8.length && u8[p] === 0xFF) {
      const m = u8[p + 1];
      if (m === 0xDA || m === 0xD9) break;
      const len = (u8[p + 2] << 8) | u8[p + 3];
      if (m === 0xE1 && u8[p + 4] === 0x45 && u8[p + 5] === 0x78 && u8[p + 6] === 0x69 && u8[p + 7] === 0x66) readTiff(u8, p + 10, r);
      if (len < 2) break;
      p += 2 + len;
    }
    return r;
  }
  function readTiff(u8, b, r) {
    if (b + 8 > u8.length) return;
    const le = u8[b] === 0x49, dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const g16 = o => dv.getUint16(o, le), g32 = o => dv.getUint32(o, le);
    if (g16(b + 2) !== 42) return;
    const ifd = (off, fn) => {
      if (!off || b + off + 2 > u8.length) return;
      const n = Math.min(g16(b + off), 200);
      for (let i = 0; i < n; i++) { const e = b + off + 2 + i * 12; if (e + 12 > u8.length) return; fn(g16(e), g32(e + 4), e + 8); }
    };
    ifd(g32(b + 4), (t, c, vo) => {
      if (t === 0x010F && c > 1) r.make = true;
      if (t === 0x0110 && c > 1) r.model = true;
      if (t === 0x0132 && c > 1) r.captureTime = true;
      if (t === 0x8769) ifd(g32(vo), (t2, c2) => { if ((t2 === 0x9003 || t2 === 0x9004) && c2 > 1) r.captureTime = true; });
      // GPS: only tag PRESENCE is recorded. Coordinate values are never read.
      if (t === 0x8825) ifd(g32(vo), t3 => { if (t3 === 0x0002 || t3 === 0x0004) r.gps = true; });
    });
  }

  /* Synthetic EXIF (invented values, zeroed GPS) for the demo and tests. */
  function buildSyntheticApp1() {
    const buf = new Uint8Array(218), dv = new DataView(buf.buffer);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) buf[o + i] = s.charCodeAt(i); };
    const ent = (o, t, ty, c, v) => { dv.setUint16(o, t); dv.setUint16(o + 2, ty); dv.setUint32(o + 4, c); dv.setUint32(o + 8, v); };
    w(0, 'MM'); dv.setUint16(2, 42); dv.setUint32(4, 8); dv.setUint16(8, 4);
    ent(10, 0x010F, 2, 9, 62); ent(22, 0x0110, 2, 7, 71); ent(34, 0x8769, 4, 1, 78); ent(46, 0x8825, 4, 1, 116);
    w(62, 'SynthCam'); w(71, 'Demo-1');
    dv.setUint16(78, 1); ent(80, 0x9003, 2, 20, 96); w(96, '2024:01:01 12:00:00');
    dv.setUint16(116, 4); ent(118, 1, 2, 2, 0); w(126, 'N'); ent(130, 2, 5, 3, 170);
    ent(142, 3, 2, 2, 0); w(150, 'E'); ent(154, 4, 5, 3, 194);
    for (let i = 0; i < 6; i++) dv.setUint32(170 + i * 8 + 4, 1);
    const seg = new Uint8Array(4 + 6 + 218);
    seg[0] = 0xFF; seg[1] = 0xE1; seg[2] = 0; seg[3] = 232;
    seg.set([0x45, 0x78, 0x69, 0x66, 0, 0], 4); seg.set(buf, 10);
    return seg;
  }
  function injectApp1(jpeg, app1) {
    const out = new Uint8Array(jpeg.length + app1.length);
    out.set(jpeg.subarray(0, 2), 0); out.set(app1, 2); out.set(jpeg.subarray(2), 2 + app1.length);
    return out;
  }

  /* Bio check: returns booleans only. Matched text is never returned or stored. */
  function scanBio(text) {
    const t = String(text || '');
    const digits = s => s.replace(/\D/g, '').length;
    const phoneHit = (t.match(/\+?\d[\d\s().-]{8,16}\d/g) || []).some(m => digits(m) >= 10 && digits(m) <= 13);
    return {
      email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(t),
      phone: phoneHit,
      address: /\b\d{1,4}[A-Za-z]?[,\s]+[A-Za-z0-9 .]{2,30}\b(street|st|road|rd|lane|ln|nagar|colony|apartment|apt|sector|block|avenue|ave)\b|\b(flat|house|plot)\s*(no\.?)?\s*\d+/i.test(t)
    };
  }

  /* Illustrative indicator: 100 - sum(weights of supported clue types found). Higher = fewer clues. */
  function score(photo, bio) {
    let pen = 0; const hit = [];
    if (photo) {
      if (photo.gps) { pen += W.gps; hit.push('gps'); }
      if (photo.captureTime) { pen += W.captureTime; hit.push('captureTime'); }
      if (photo.make || photo.model) { pen += W.device; hit.push('device'); }
    }
    if (bio) for (const k of ['email', 'phone', 'address']) if (bio[k]) { pen += W[k]; hit.push(k); }
    return { value: Math.max(0, 100 - pen), penalty: pen, hit };
  }
  const api = { parseExif, buildSyntheticApp1, injectApp1, scanBio, score, WEIGHTS: W };
  if (typeof module !== 'undefined') module.exports = api; else root.XRay = api;
})(this);
