/* Fictional 3D clue constellation. Plain Canvas 2D with perspective projection. No libraries, no network. */
(function () {
  const cv = document.getElementById('c3d'); if (!cv) return;
  const stage = cv.closest('.constellation-stage'), ctx = cv.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = '#00f0ff', M = '#ff2bd6', Y = '#fcee0a', F = '"Segoe UI",system-ui,sans-serif';
  let W = 0, H = 0, ang = 0.6, tilt = 0.22, drag = null, visible = true; const t0 = performance.now();
  const nodes = [
    { x: -1.15, y: .75, z: .55, a: 'PUBLIC HANDLE', b: '@samplehandle' }, { x: 1.15, y: .75, z: -.55, a: 'BIO CLUE', b: 'Design student' },
    { x: -1.15, y: -.75, z: -.55, a: 'PHOTO METADATA', b: 'Location tag present' }, { x: 1.15, y: -.75, z: .55, a: 'CONTACT CLUE', b: 'Public email pattern' }];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const stars = Array.from({ length: 90 }, () => ({ x: (rnd() - .5) * 5, y: (rnd() - .5) * 3.2, z: (rnd() - .5) * 4 }));
  function proj(p) {
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
    const x = p.x * ca + p.z * sa, z = -p.x * sa + p.z * ca, y2 = p.y * ct - z * st, z2 = p.y * st + z * ct;
    const s = 4.6 / (4.6 + z2), R = Math.min(W / 3.5, H / 2.7);
    return { x: W / 2 + x * s * R, y: H / 2 - y2 * s * R, z: z2, s };
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function node(o) {
    const q = o.q, n = o.n, k = Math.max(.7, Math.min(1.25, q.s)), w = Math.min(210 * k, W * .38), h = 54 * k, x = q.x - w / 2, y = q.y - h / 2;
    ctx.globalAlpha = .6 + .4 * Math.min(1, q.s); ctx.shadowColor = C; ctx.shadowBlur = 14 * k; ctx.fillStyle = '#120a33'; ctx.strokeStyle = C; ctx.lineWidth = 1.5;
    rr(x, y, w, h, 10 * k); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.textAlign = 'left';
    ctx.fillStyle = '#a9a5cc'; ctx.font = '600 ' + 9.5 * k + 'px ' + F; ctx.fillText(n.a, x + 10 * k, y + 19 * k, w - 16 * k);
    ctx.fillStyle = '#e8f6ff'; ctx.font = '700 ' + 14 * k + 'px ' + F; ctx.fillText(n.b, x + 10 * k, y + 39 * k, w - 16 * k); ctx.globalAlpha = 1;
  }
  function hubDraw(q, on) {
    const r = Math.max(34, Math.min(W, H) * .085) * q.s, g = ctx.createRadialGradient(q.x, q.y, 2, q.x, q.y, r * 2.2);
    g.addColorStop(0, 'rgba(255,43,214,.45)'); g.addColorStop(1, 'rgba(255,43,214,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r * 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#1a0a33'; ctx.strokeStyle = M; ctx.lineWidth = 2.5; ctx.shadowColor = M; ctx.shadowBlur = on ? 26 : 10; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.textAlign = 'center'; ctx.fillStyle = '#a9a5cc'; ctx.font = '600 ' + 10.5 * q.s + 'px ' + F; ctx.fillText('POSSIBLE', q.x, q.y - 4);
    ctx.fillStyle = Y; ctx.font = '800 ' + 17 * q.s + 'px ' + F; ctx.fillText('LINKS?', q.x, q.y + 16 * q.s);
  }
  function draw(now) {
    ctx.clearRect(0, 0, W, H); const on = stage.classList.contains('on'), tt = (now - t0) / 1000;
    for (const s of stars) { const q = proj(s); ctx.globalAlpha = .2 + .35 * q.s * .5; ctx.fillStyle = '#9fe8ff'; ctx.fillRect(q.x, q.y, 1.6 * q.s, 1.6 * q.s); }
    ctx.globalAlpha = 1; const hub = proj({ x: 0, y: 0, z: 0 }), P = nodes.map(n => { const q = proj(n), hw = Math.min(115, W * .2); q.x = Math.max(hw, Math.min(W - hw, q.x)); q.y = Math.max(34, Math.min(H - 56, q.y)); return { n, q }; });
    ctx.strokeStyle = 'rgba(252,238,10,.45)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, q = proj({ x: Math.cos(a) * .62, y: 0, z: Math.sin(a) * .62 }); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
    ctx.stroke(); ctx.setLineDash([]);
    P.forEach((o, i) => {
      const g = ctx.createLinearGradient(o.q.x, o.q.y, hub.x, hub.y); g.addColorStop(0, C); g.addColorStop(1, M);
      ctx.strokeStyle = g; ctx.lineWidth = on ? 2.6 : 1.2; ctx.globalAlpha = on ? .95 : .35; ctx.setLineDash(on ? [] : [7, 7]);
      ctx.beginPath(); ctx.moveTo(o.q.x, o.q.y); ctx.lineTo(hub.x, hub.y); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      if (on) { const u = reduce ? .5 : ((tt * .45 + i * .25) % 1); ctx.fillStyle = Y; ctx.shadowColor = Y; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(o.q.x + (hub.x - o.q.x) * u, o.q.y + (hub.y - o.q.y) * u, 3.4, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    });
    P.slice().sort((a, b) => b.q.z - a.q.z).forEach(node); hubDraw(hub, on); // hub drawn last so its label stays readable
    ctx.textAlign = 'left'; ctx.fillStyle = Y; ctx.font = '600 11px ' + F; ctx.fillText('FICTIONAL DATA · OFFLINE · NOT REAL PEOPLE', 14, H - 14);
  }
  function size() { const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); draw(performance.now()); }
  function frame(now) { if (visible && !document.hidden) { if (!drag) ang += .004; draw(now); } requestAnimationFrame(frame); }
  const redraw = () => { if (reduce) draw(performance.now()); };
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, a: ang, t: tilt }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; ang = drag.a + (e.clientX - drag.x) * .006; tilt = Math.max(-.3, Math.min(.45, drag.t + (e.clientY - drag.y) * .003)); redraw(); });
  ['pointerup', 'pointercancel'].forEach(n => cv.addEventListener(n, () => { drag = null; }));
  cv.addEventListener('keydown', e => { const k = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, .1], ArrowDown: [0, -.1] }[e.key]; if (!k) return; e.preventDefault(); ang += k[0]; tilt = Math.max(-.3, Math.min(.45, tilt + k[1])); redraw(); });
  new MutationObserver(redraw).observe(stage, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
  window.addEventListener('resize', size); size(); if (!reduce) requestAnimationFrame(frame);
  // Hero 3D tilt (decorative; skipped for reduced motion)
  const art = document.querySelector('.hero-art');
  if (art && !reduce) {
    art.style.transition = 'transform .15s ease-out'; art.style.willChange = 'transform';
    art.addEventListener('pointermove', e => { const r = art.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; art.style.transform = 'perspective(900px) rotateY(' + px * 12 + 'deg) rotateX(' + -py * 12 + 'deg)'; });
    art.addEventListener('pointerleave', () => { art.style.transform = ''; });
  }
})();
