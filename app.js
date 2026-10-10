(function () {
  const X = window.XRay, $ = id => document.getElementById(id);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.textContent = h; return e; };
  const L = { gps: ['Location tags found', 'The photo has GPS location tags (coordinates are never shown).', 'Turn off camera location tagging, or share a clean copy.'],
    captureTime: ['Capture time found', 'The photo records when it was taken.', 'Share a clean copy if timing could reveal your routine.'],
    device: ['Device make/model found', 'The photo names the kind of device used.', 'A clean copy drops this field.'],
    email: ['Possible email pattern', 'The text looks like it contains an email address.', 'Use a contact form or a public-only address.'],
    phone: ['Possible phone pattern', 'The text looks like it contains a phone number.', 'Share it privately, not in public text.'],
    address: ['Possible address pattern', 'The text looks like it contains a street or house address.', 'Mention only a city, or nothing.'] };
  const names = r => [['gps', 'location tags'], ['captureTime', 'capture time'], ['make', 'device make'], ['model', 'device model']].filter(p => r[p[0]]).map(p => p[1]);
  let file = null, synthetic = false;

  function show(box, res, bad) {
    const s = X.score(bad ? null : res.photo, res.bio); box.replaceChildren(); box.hidden = false;
    box.append(el('div', 'score', s.value + ' / 100'),
      el('p', 'fine-print', 'Illustrative indicator, not a validated rating. Formula: 100 − ' + s.penalty + ' penalty points (location 30, time 10, device 10, email 15, phone 15, address 15). Higher = fewer clues found.'));
    if (!s.hit.length) { const c = el('div', 'card ok'); c.append(el('h4', '', 'No supported clues found'), el('p', '', 'Only the listed fields and patterns were checked.')); box.append(c); }
    s.hit.forEach(k => { const c = el('div', 'card'); c.append(el('h4', '', L[k][0]), el('p', '', L[k][1]), el('p', '', 'Suggestion: ' + L[k][2])); box.append(c); });
    return box;
  }
  const err = (box, t, d) => { box.replaceChildren(); box.hidden = false; const c = el('div', 'card err'); c.append(el('h4', '', t), el('p', '', d)); box.append(c); };
  const sync = () => { $('scan-button').disabled = !(file && $('consent').checked) && !synthetic; $('profile-scan').disabled = !($('profile-consent').checked && $('profile-text').value.trim()); };

  async function scanPhoto() {
    const box = $('result'), r = X.parseExif(new Uint8Array(await file.arrayBuffer()));
    if (!r.isJpeg) return err(box, 'This file could not be read', 'Only JPEG/JPG is supported (not PNG, HEIC, WebP). Try a .jpg file.');
    show(box, { photo: r });
    const f = names(r), c = el('div', 'card ' + (f.length ? '' : 'ok'));
    c.append(el('h4', '', 'Fields found: ' + (f.length ? f.join(', ') : 'none of the supported ones')), el('p', '', (synthetic ? 'Synthetic sample with invented metadata. ' : '') + 'Supported: GPS tag presence, capture time, make, model. Your original is unchanged.'));
    const b = el('button', 'button button-outline', 'Make and verify clean copy'); b.type = 'button'; const out = el('div');
    b.onclick = async () => {
      try {
        const bmp = await createImageBitmap(file), cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height; cv.getContext('2d').drawImage(bmp, 0, 0);
        const blob = await new Promise((ok, no) => cv.toBlob(x => x ? ok(x) : no(), 'image/jpeg', .92));
        const n = X.parseExif(new Uint8Array(await blob.arrayBuffer())), left = names(n), k = el('div', 'card ' + (left.length ? '' : 'ok'));
        k.append(el('h4', '', !n.isJpeg ? 'Could not verify the copy' : left.length ? 'Still found in copy: ' + left.join(', ') : 'None of the supported fields found in the copy'),
          el('p', '', 'Re-scanned for GPS tags, capture time, make and model only. Other metadata (XMP, IPTC) is not checked, so this is not a claim of complete removal.'));
        const a = el('a', 'button button-bright', 'Download clean copy'); a.href = URL.createObjectURL(blob); a.download = 'clean-copy.jpg'; k.append(a); out.replaceChildren(k);
      } catch (e) { err(out, 'Could not create a clean copy', 'Your original is unchanged and no removal is claimed.'); }
    };
    box.append(c, b, out);
  }
  $('image-file').onchange = e => { file = e.target.files[0] || null; synthetic = false; const s = $('selected-file'); s.hidden = !file; s.textContent = file ? 'Selected: ' + file.name : ''; sync(); };
  $('consent').onchange = sync; $('profile-consent').onchange = sync;
  $('profile-text').oninput = () => { $('bio-count').textContent = $('profile-text').value.length; sync(); };
  $('scan-button').onclick = async () => { if (!file) return; await scanPhoto(); $('consent').checked = false; synthetic = false; sync(); };
  $('profile-scan').onclick = () => {
    show($('profile-result'), { bio: X.scanBio($('profile-text').value) }); $('profile-consent').checked = false; sync();
  };
  $('load-demo-image').onclick = async () => {
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 220; const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 320, 220);
    gr.addColorStop(0, '#00f0ff'); gr.addColorStop(1, '#ff2bd6'); g.fillStyle = gr; g.fillRect(0, 0, 320, 220);
    const b = await new Promise(r => cv.toBlob(r, 'image/jpeg', .9));
    file = new Blob([X.injectApp1(new Uint8Array(await b.arrayBuffer()), X.buildSyntheticApp1())], { type: 'image/jpeg' }); file.name = 'synthetic-sample.jpg'; synthetic = true;
    $('selected-file').hidden = false; $('selected-file').textContent = 'Synthetic sample loaded (all metadata invented; no consent tick needed)';
    $('profile-text').value = 'Asha Demo (fictional) · asha.demo@example.com · +91 90000 00000 · 12 Example Street'; $('bio-count').textContent = $('profile-text').value.length;
    await scanPhoto(); show($('profile-result'), { bio: X.scanBio($('profile-text').value) }); synthetic = false; sync(); $('result').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  $('run-demo').onclick = () => {
    document.querySelector('.constellation-stage').classList.add('on'); $('graph-status').textContent = 'FICTIONAL LINKS SHOWN';
    $('lab-takeaway').lastElementChild.textContent = 'In this invented story, a reused handle, a bio line, a photo tag and a contact pattern could be linked by someone. That is a possibility, not proof. Varying handles and keeping location and contact details out of public posts makes linking harder.';
  };
  sync();
})();
