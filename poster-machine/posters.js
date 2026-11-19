// Poster Machine renderer: bookmark -> brutalist poster. Shared by Poster Machine and Bookmark Zine.

const W = 1000, H = 1414, M = 64;           // A-series poster, logical units
const LAYOUTS = ['shout', 'stack', 'numbers', 'grid', 'ticker'];
const INKS = {
  newsprint: { bg: '#f2f0eb', ink: '#111111', acc: '#ff3b1f', on: '#111111' },
  safety:    { bg: '#ffd400', ink: '#111111', acc: '#111111', on: '#ffd400' },
  klein:     { bg: '#1c2ad6', ink: '#f2f0eb', acc: '#ffd400', on: '#111111' },
  concrete:  { bg: '#c9c6bf', ink: '#121212', acc: '#0047ff', on: '#f2f0eb' },
  blackout:  { bg: '#111111', ink: '#f2f0eb', acc: '#ff3b1f', on: '#111111' },
  signal:    { bg: '#ff3b1f', ink: '#111111', acc: '#f2f0eb', on: '#111111' },
  mint:      { bg: '#b8f2d0', ink: '#0d1f17', acc: '#ff3b1f', on: '#0d1f17' },
};
const F = { display: '"Anton", Impact, "Arial Narrow", sans-serif', heavy: '"Archivo Black", "Arial Black", sans-serif', mono: '"Space Mono", Menlo, monospace' };


// ---------- helpers ----------
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function clean(t) {
  return t.normalize('NFKC').replace(/https?:\/\/\S+/g, '').replace(/\p{Extended_Pictographic}|️/gu, '').replace(/\s+/g, ' ').trim();
}
function font(ctx, size, fam) { ctx.font = `${size}px ${fam}`; }
function wrap(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function ascent(ctx, s) { const m = ctx.measureText(s); return m.actualBoundingBoxAscent || parseFloat(ctx.font) * .75; }
// Wrap at the largest size that fits the box.
function fitBlock(ctx, text, fam, maxW, maxH, maxSize, lh = 1.12, minSize = 14) {
  for (let s = maxSize; s >= minSize; s -= 2) {
    font(ctx, s, fam);
    const lines = wrap(ctx, text, maxW);
    if (lines.length * s * lh <= maxH && lines.every(l => ctx.measureText(l).width <= maxW)) return { size: s, lines };
  }
  font(ctx, minSize, fam); return { size: minSize, lines: wrap(ctx, text, maxW) };
}
function keyWords(t) {
  const first = t.split(/(?<=[.!?])\s/)[0].replace(/[.!?]+$/, '');
  const w = first.split(' ');
  return (w.length <= 6 ? w : w.slice(0, 4)).join(' ');
}
function benchPairs(t) {
  const out = []; const re = /([A-Za-z][\w .()+\-]*?)\s*:\s*(\d+(?:\.\d+)?)\s*s\b/g; let m;
  while ((m = re.exec(t))) out.push({ label: m[1].split(/[.!?]\s+/).pop().trim(), v: parseFloat(m[2]) });
  return out;
}
function headline(t) {
  const m = t.match(/(~?\d+(?:\.\d+)?)\s*(×|x\b|%|\s?days|\s?hours|\s?minutes|\s?ms)/i);
  if (!m) return null;
  const unit = m[2].trim().replace(/^x$/i, '×');
  return (m[1] + (/^[a-z]{2,}$/i.test(unit) ? ' ' : '') + unit).toUpperCase();
}

// o: { layout: 'auto' | name, ink: 'auto' | name, seed (global reroll), total (posters in the set, for the № line) }
function choose(item, idx, o) {
  const r = rng(hash(item.url + item.text) + (item.seed || 0) * 7919 + o.seed * 104729);
  const t = clean(item.text);
  const g = o.layout || 'auto';
  let layout = item.layout || (g !== 'auto' ? g : null);
  if (!layout) {
    if (benchPairs(t).length >= 2 || (headline(t) && r() < .7)) layout = 'numbers';
    else if (t.split(' ').length <= 6) layout = r() < .75 ? 'shout' : 'ticker';
    else layout = pick(r, ['stack', 'grid', 'ticker', 'stack', 'shout']);
  }
  const gi = o.ink || 'auto';
  const inkName = item.ink || (gi !== 'auto' ? gi : pick(r, Object.keys(INKS)));
  return { r, t, layout, inkName, ink: INKS[inkName], idx, total: o.total };
}

// ---------- shared frame ----------
function frame(ctx, item, c) {
  const { ink } = c;
  ctx.fillStyle = ink.bg; ctx.fillRect(0, 0, W, H);
  font(ctx, 18, F.mono); ctx.fillStyle = ink.ink; ctx.textBaseline = 'alphabetic';
  ctx.fillText('BOOKMARKED', M, M - 20);
  const n = `№ ${String(c.idx + 1).padStart(2, '0')}/${String(c.total).padStart(2, '0')}`;
  ctx.textAlign = 'right'; ctx.fillText(n, W - M, M - 20); ctx.textAlign = 'left';
  ctx.fillRect(M, M - 8, W - 2 * M, 3);
  ctx.fillRect(M, H - M - 2, W - 2 * M, 3);
  font(ctx, 18, F.mono);
  ctx.fillText(`@${item.handle}`.toUpperCase(), M, H - M + 30);
  ctx.textAlign = 'right'; ctx.fillText(item.date.split('-').reverse().join('.'), W - M, H - M + 30); ctx.textAlign = 'left';
}
const TOP = M + 24, BOTTOM = H - M - 24, INNER = W - 2 * M;

// ---------- layouts ----------
const draw = {
  shout(ctx, item, c) {
    const { ink, r } = c;
    const words = keyWords(c.t).toUpperCase().split(' ');
    const lines = [];
    for (const w of words) { if (lines.length && (lines[lines.length - 1].length + w.length < 7)) lines[lines.length - 1] += ' ' + w; else lines.push(w); }
    const bodyH = 220, availH = BOTTOM - TOP - bodyH;
    const gap = 14;
    let sizes = lines.map(l => { font(ctx, 100, F.display); return 100 * INNER / ctx.measureText(l).width; });
    sizes = sizes.map(s => Math.min(s, 560));
    let heights = lines.map((l, i) => { font(ctx, sizes[i], F.display); return ascent(ctx, l); });
    let total = heights.reduce((a, b) => a + b, 0) + gap * (lines.length - 1);
    const k = Math.min(1, availH / total);
    sizes = sizes.map(s => s * k); heights = heights.map(h => h * k); total = total * k;
    const hi = Math.floor(r() * lines.length);
    let y = TOP + 10;
    lines.forEach((l, i) => {
      font(ctx, sizes[i], F.display);
      const w = ctx.measureText(l).width;
      if (i === hi) { ctx.fillStyle = ink.acc; ctx.fillRect(M - 8, y - 8, Math.min(w + 16, INNER + 16), heights[i] + 16); }
      ctx.fillStyle = i === hi ? ink.on : ink.ink;
      ctx.fillText(l, M, y + heights[i]);
      y += heights[i] + gap;
    });
    // full text, small, in the lower right column
    ctx.fillStyle = ink.ink;
    const colX = M + INNER * .42, colW = INNER * .58;
    const b = fitBlock(ctx, c.t, F.mono, colW, bodyH - 30, 26, 1.35);
    let by = BOTTOM - b.lines.length * b.size * 1.35 + b.size;
    b.lines.forEach(l => { ctx.fillText(l, colX, by); by += b.size * 1.35; });
    font(ctx, 18, F.mono); ctx.fillText('→ ' + item.name.toUpperCase(), M, BOTTOM);
  },

  stack(ctx, item, c) {
    const { ink, r } = c;
    const text = c.t.toUpperCase();
    const availH = BOTTOM - TOP - 10, lh = 1.06;
    let best = null;
    for (let s = 220; s >= 26; s -= 4) {
      font(ctx, s, F.heavy);
      const lines = wrap(ctx, text, INNER);
      const sizes = lines.map(l => Math.min(s * 1.7, s * INNER / ctx.measureText(l).width));
      const total = sizes.reduce((a, x) => a + x * .74 * lh + 10, 0);
      if (total <= availH) { best = { lines, sizes }; break; }
    }
    if (!best) { font(ctx, 26, F.heavy); best = { lines: wrap(ctx, text, INNER), sizes: [] }; best.sizes = best.lines.map(() => 26); }
    const accLine = Math.floor(r() * best.lines.length);
    let y = TOP;
    best.lines.forEach((l, i) => {
      font(ctx, best.sizes[i], F.heavy);
      const a = ascent(ctx, l);
      y += a;
      ctx.fillStyle = i === accLine ? ink.acc : ink.ink;
      ctx.fillText(l, M, y);
      y += best.sizes[i] * .74 * (lh - 1) + 10;
    });
  },

  numbers(ctx, item, c) {
    const { ink } = c;
    const pairs = benchPairs(c.t);
    if (pairs.length >= 2) {
      const title = c.t.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, '').split(':')[0].toUpperCase();
      const tb = fitBlock(ctx, title, F.display, INNER, 300, 170, 1.0);
      ctx.fillStyle = ink.ink; let y = TOP;
      tb.lines.forEach(l => { font(ctx, tb.size, F.display); y += ascent(ctx, l); ctx.fillText(l, M, y); y += 14; });
      y += 30;
      const max = Math.max(...pairs.map(p => p.v)), min = Math.min(...pairs.map(p => p.v));
      const rowH = Math.min(150, (BOTTOM - y - 60) / pairs.length);
      pairs.forEach((p, i) => {
        const ry = y + i * rowH;
        const barW = Math.max(6, (p.v / max) * (INNER * .62));
        ctx.fillStyle = p.v === min ? ink.acc : ink.ink;
        ctx.fillRect(M, ry + rowH * .38, barW, rowH * .42);
        ctx.fillStyle = ink.ink; font(ctx, Math.min(24, rowH * .22), F.mono);
        ctx.fillText(`${String(i + 1).padStart(2, '0')}  ${p.label.toUpperCase()}`, M, ry + rowH * .3);
        font(ctx, rowH * .62, F.display); ctx.textAlign = 'right';
        ctx.fillText(p.v.toFixed(2) + 's', W - M, ry + rowH * .8); ctx.textAlign = 'left';
      });
      const tail = c.t.match(/[^.]*$/)[0].trim() || c.t.split('. ').pop();
      font(ctx, 22, F.mono); ctx.fillText(tail.toUpperCase().slice(0, 60), M, BOTTOM);
      return;
    }
    const big = headline(c.t) || String(c.t.length);
    font(ctx, 100, F.display);
    let s = Math.min(900, 100 * INNER / ctx.measureText(big).width);
    font(ctx, s, F.display);
    let a = ascent(ctx, big);
    if (a > (BOTTOM - TOP) * .6) { s *= ((BOTTOM - TOP) * .6) / a; font(ctx, s, F.display); a = ascent(ctx, big); }
    ctx.fillStyle = ink.acc; ctx.fillRect(M, TOP, INNER, a + 40);
    ctx.fillStyle = ink.on;
    ctx.fillText(big, M, TOP + 20 + a);
    ctx.fillStyle = ink.ink;
    const y0 = TOP + a + 90;
    const b = fitBlock(ctx, c.t.toUpperCase(), F.heavy, INNER, BOTTOM - y0 - 20, 72, 1.08);
    let y = y0 + b.size;
    b.lines.forEach(l => { ctx.fillText(l, M, y); y += b.size * 1.08; });
  },

  grid(ctx, item, c) {
    const { ink, r } = c;
    const cols = 6, rows = 8, cw = INNER / cols, rh = (BOTTOM - TOP) / rows;
    ctx.strokeStyle = ink.ink; ctx.globalAlpha = .18; ctx.lineWidth = 2;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(M + i * cw, TOP); ctx.lineTo(M + i * cw, BOTTOM); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(M, TOP + j * rh); ctx.lineTo(W - M, TOP + j * rh); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // one big shape, snapped to the grid
    ctx.fillStyle = ink.acc;
    const gx = Math.floor(r() * 3) + 2, gy = Math.floor(r() * 3) + 3;
    if (r() < .5) { ctx.beginPath(); ctx.arc(M + gx * cw, TOP + gy * rh, cw * 2, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(M + gx * cw - cw, TOP + gy * rh - rh, cw * 3, rh * 3);
    // giant outlined index
    const num = String(c.idx + 1).padStart(2, '0');
    font(ctx, 520, F.display); ctx.lineWidth = 4; ctx.strokeStyle = ink.ink; ctx.textAlign = 'right';
    ctx.strokeText(num, W - M - 10, BOTTOM - 10); ctx.textAlign = 'left';
    // the text, in the top five columns
    ctx.fillStyle = ink.ink;
    const b = fitBlock(ctx, c.t, F.heavy, cw * 5 - 10, rh * 4.5, 110, 1.05);
    let y = TOP + 10 + b.size;
    b.lines.forEach(l => { ctx.fillText(l, M + 4, y); y += b.size * 1.05; });
    // vertical byline on the right edge
    ctx.save(); ctx.translate(W - M + 34, TOP); ctx.rotate(Math.PI / 2);
    font(ctx, 18, F.mono); ctx.fillText(`${item.name.toUpperCase()} — X.COM/${item.handle.toUpperCase()}`, 0, 0); ctx.restore();
  },

  ticker(ctx, item, c) {
    const { ink, r } = c;
    const phrase = (keyWords(c.t).toUpperCase() + '  /  ');
    ctx.save();
    ctx.beginPath(); ctx.rect(M, TOP, INNER, BOTTOM - TOP); ctx.clip();
    ctx.translate(W / 2, H / 2); ctx.rotate(-0.21 + (r() - .5) * .1); ctx.translate(-W, -H);
    const band = 120;
    for (let y = 0, i = 0; y < H * 2; y += band, i++) {
      ctx.fillStyle = i % 2 ? ink.ink : ink.acc; ctx.fillRect(0, y, W * 2, band);
      ctx.fillStyle = i % 2 ? ink.bg : ink.on;
      font(ctx, band * .78, F.display);
      const pw = ctx.measureText(phrase).width; const off = (i * 137) % pw;
      for (let x = -off; x < W * 2; x += pw) ctx.fillText(phrase, x, y + band * .86);
    }
    ctx.restore();
    // the quote card
    const cardW = INNER * .8, cx = (W - cardW) / 2;
    font(ctx, 10, F.heavy);
    const b = fitBlock(ctx, c.t, F.heavy, cardW - 80, 560, 76, 1.12, 20);
    const cardH = b.lines.length * b.size * 1.12 + 140, cy = (H - cardH) / 2;
    ctx.fillStyle = ink.ink; ctx.fillRect(cx + 14, cy + 14, cardW, cardH);
    ctx.fillStyle = ink.bg; ctx.fillRect(cx, cy, cardW, cardH);
    ctx.lineWidth = 6; ctx.strokeStyle = ink.ink; ctx.strokeRect(cx, cy, cardW, cardH);
    ctx.fillStyle = ink.ink; let y = cy + 50 + b.size;
    font(ctx, b.size, F.heavy); b.lines.forEach(l => { ctx.fillText(l, cx + 40, y); y += b.size * 1.12; });
    font(ctx, 20, F.mono); ctx.fillText('— ' + item.name.toUpperCase(), cx + 40, cy + cardH - 36);
  },
};

// Draw one poster (W × H logical units) into a canvas at the given scale
function renderPoster(canvas, item, idx, scale, o) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  const c = choose(item, idx, o);
  frame(ctx, item, c);
  draw[c.layout](ctx, item, c);
  return c;
}
