// Perfect Parking: two-arc parallel-parking simulation and plotter-ready SVG.
// Shared by Perfect Parking and Parking Calendar.

/* ---------- Seeded random ---------- */
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- Car and manoeuvre (metres; street along x, kerb at y = 0) ---------- */
function randomCar(rnd) {
  const L = 3.7 + rnd() * 1.3, W = 1.65 + rnd() * .3, b = L * (.58 + rnd() * .06), rear = L * (.2 + rnd() * .04);
  const R = 3.9 + rnd() * 1.6; // turning radius of the rear-axle centre on full lock
  return { L, W, b, rear, R };
}
// Body outline relative to the rear-axle centre, heading +x
function outline(c, per = 6) {
  const x0 = -c.rear, x1 = c.L - c.rear, y0 = -c.W / 2, y1 = c.W / 2, pts = [];
  const edge = (ax, ay, bx, by) => { for (let i = 0; i < per; i++) pts.push([ax + (bx - ax) * i / per, ay + (by - ay) * i / per]); };
  edge(x0, y0, x1, y0); edge(x1, y0, x1, y1); edge(x1, y1, x0, y1); edge(x0, y1, x0, y0);
  return pts;
}
const place = (pts, p) => { const c = Math.cos(p.th), s = Math.sin(p.th); return pts.map(([x, y]) => [p.x + x * c - y * s, p.y + x * s + y * c]); };

// Two equal arcs: reverse on right lock (rotate about the right-hand centre), then left lock. Ends at (0, park y), heading 0.
function manoeuvre(c, laneGap, steps = 160) {
  const parkY = .25 + c.W / 2, startY = .25 + 1.85 + laneGap + c.W / 2; // parked cars are 1.85 m wide
  const d = startY - parkY, phi = Math.acos(Math.max(-1, 1 - d / (2 * c.R)));
  const start = { x: 2 * c.R * Math.sin(phi), y: startY, th: 0 };
  const poses = [];
  const c1 = { x: start.x, y: start.y - c.R };
  for (let i = 0; i <= steps / 2; i++) {
    const a = phi * i / (steps / 2);
    poses.push({ x: c1.x - c.R * Math.sin(a), y: c1.y + c.R * Math.cos(a), th: a });
  }
  const mid = poses.at(-1), c2 = { x: mid.x - c.R * Math.sin(mid.th), y: mid.y + c.R * Math.cos(mid.th) };
  for (let i = 1; i <= steps / 2; i++) {
    const a = phi * (1 - i / (steps / 2));
    poses.push({ x: c2.x + c.R * Math.sin(a), y: c2.y - c.R * Math.cos(a), th: a });
  }
  // Gap needed: how far the body reaches along the street while any part of it is inside the parking lane
  const body = outline(c, 10), laneTop = .25 + 1.85;
  let lo = Infinity, hi = -Infinity;
  for (const p of poses) for (const [x, y] of place(body, p)) if (y < laneTop) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
  return { poses, phi, start, gap: hi - lo, lo, hi };
}

/* ---------- Drawing into polylines (pen 1: cars and kerb, pen 2: corner traces) ---------- */
function drawEvent(c, m, ghosts, mirror) {
  const pen1 = [], pen2 = [];
  const box = (p, car) => { const q = place([[-car.rear, -car.W / 2], [car.L - car.rear, -car.W / 2], [car.L - car.rear, car.W / 2], [-car.rear, car.W / 2]], p); return [...q, q[0]]; };
  // Ghost outlines along the path, with the front axle marked
  for (let g = 0; g < ghosts; g++) {
    const p = m.poses[Math.round(g * (m.poses.length - 1) / (ghosts - 1))];
    pen1.push(box(p, c));
    pen1.push(place([[c.b, -c.W / 2 + .15], [c.b, c.W / 2 - .15]], p));
  }
  // Corner and axle traces
  const corners = [[-c.rear, -c.W / 2], [c.L - c.rear, -c.W / 2], [c.L - c.rear, c.W / 2], [-c.rear, c.W / 2], [0, 0]];
  for (const k of corners) pen2.push(m.poses.map(p => place([k], p)[0]));
  // Parked neighbours just clear of the sweep, and the kerb
  const pc = { L: 4.3, W: 1.85, rear: .9 }, py = .25 + .925;
  pen1.push(box({ x: m.hi + pc.rear, y: py, th: 0 }, pc));
  pen1.push(box({ x: m.lo - (pc.L - pc.rear), y: py, th: 0 }, pc));
  pen1.push([[m.lo - pc.L - .6, 0], [m.hi + pc.L + .6, 0]]);
  const f = mirror ? ([x, y]) => [-x, y] : v => v;
  return { pen1: pen1.map(l => l.map(f)), pen2: pen2.map(l => l.map(f)) };
}
const bounds = lines => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const l of lines) for (const [x, y] of l) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return { x: a, y: b, w: c - a, h: d - b }; };
const tx = (lines, f) => lines.map(l => l.map(f));

/* ---------- Layouts: return { pen1, pen2, labels } in paper millimetres ---------- */
const PAPERS = { A4: [210, 297], A3: [297, 420], Square: [300, 300] };
function fitInto(ev, cell, flipY = true) {
  const all = [...ev.pen1, ...ev.pen2], b = bounds(all);
  const s = Math.min(cell.w / b.w, cell.h / b.h);
  const ox = cell.x + (cell.w - b.w * s) / 2, oy = cell.y + (cell.h - b.h * s) / 2;
  // Paper y grows down; street y grows away from the kerb, so flip to keep the kerb at the bottom
  const f = ([x, y]) => [ox + (x - b.x) * s, flipY ? oy + (b.y + b.h - y) * s : oy + (y - b.y) * s];
  return { pen1: tx(ev.pen1, f), pen2: tx(ev.pen2, f), s };
}

// o.area (optional, mm) limits the drawing to part of the sheet; by default it's the sheet minus an 18 mm margin
function build(o) {
  const rnd = mulberry32(o.seed), [PW, PH] = PAPERS[o.paper], M = 18;
  const A = o.area || { x: M, y: M, w: PW - 2 * M, h: PH - 2 * M };
  const pen1 = [], pen2 = [], labels = [];
  const events = Array.from({ length: o.count }, () => { const c = randomCar(rnd); const m = manoeuvre(c, .3 + rnd() * .9); return { c, m }; });

  if (o.layout === 'grid') {
    // Choose the column count that draws the manoeuvres largest (each one is roughly 3:1 landscape)
    const b0 = bounds([...drawEvent(events[0].c, events[0].m, 2, false).pen1]), aspect = b0.w / b0.h;
    let cols = 1, best = 0;
    for (let k = 1; k <= o.count; k++) {
      const r = Math.ceil(o.count / k), w = A.w / k - 8, h = (A.h - 10) / r - 16;
      const s = Math.min(w, h * aspect); if (s > best) { best = s; cols = k; }
    }
    const rows = Math.ceil(o.count / cols);
    const cw = A.w / cols, ch = (A.h - 10) / rows;
    events.forEach(({ c, m }, i) => {
      const cell = { x: A.x + (i % cols) * cw + 4, y: A.y + Math.floor(i / cols) * ch + 4, w: cw - 8, h: ch - 16 };
      const f = fitInto(drawEvent(c, m, o.ghosts, false), cell);
      pen1.push(...f.pen1); pen2.push(...f.pen2);
      labels.push({ x: cell.x, y: cell.y + cell.h + 7, t: `R ${c.R.toFixed(1)} · L ${c.L.toFixed(1)} · gap ${m.gap.toFixed(2)} m` });
    });
  } else if (o.layout === 'street') {
    const rows = Math.max(1, Math.ceil(o.count / 2)), rh = A.h / rows;
    events.forEach(({ c, m }, i) => {
      const r = Math.floor(i / 2), left = i % 2 === 0;
      const cell = { x: left ? A.x : A.x + A.w / 2 + 2, y: A.y + r * rh + 2, w: A.w / 2 - 2, h: rh - 6 };
      const f = fitInto(drawEvent(c, m, o.ghosts, !left), cell);
      pen1.push(...f.pen1); pen2.push(...f.pen2);
    });
  } else { // rosette: every manoeuvre turned around the centre of the sheet
    const cx = A.x + A.w / 2, cy = A.y + A.h / 2, rad = Math.min(A.w, A.h) / 2;
    let maxR = 0; const evs = events.map(({ c, m }) => { const e = drawEvent(c, m, o.ghosts, false); e.pen1.splice(-3); for (const l of [...e.pen1, ...e.pen2]) for (const [x, y] of l) maxR = Math.max(maxR, Math.hypot(x, y + 3)); return e; });
    const s = rad / maxR;
    evs.forEach((e, i) => {
      const a = i / evs.length * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const f = ([x, y]) => { const X = x, Y = y + 3; return [cx + (X * ca - Y * sa) * s, cy + (X * sa + Y * ca) * s]; };
      pen1.push(...tx(e.pen1, f)); pen2.push(...tx(e.pen2, f));
    });
  }
  return { PW, PH, pen1, pen2, labels, events };
}

/* ---------- SVG output ---------- */
const len = l => { let s = 0; for (let i = 1; i < l.length; i++) s += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]); return s; };
const d = l => 'M' + l.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L');
// extra: more SVG (e.g. a calendar layer) placed before the closing tag
function svg(r, o, extra = '') {
  const ink2 = o.pens === 1 ? '#111' : '#e8341c';
  const layer = (id, name, color, lines, w) => `<g id="${id}" inkscape:groupmode="layer" inkscape:label="${name}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${lines.map(l => `<path d="${d(l)}"/>`).join('')}</g>`;
  const text = r.labels.length ? `<g id="labels" inkscape:groupmode="layer" inkscape:label="3 labels" fill="#111" font-family="Space Mono, monospace" font-size="2.6">${r.labels.map(t => `<text x="${t.x.toFixed(1)}" y="${t.y.toFixed(1)}">${t.t}</text>`).join('')}</g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${r.PW}mm" height="${r.PH}mm" viewBox="0 0 ${r.PW} ${r.PH}" role="img" aria-label="Plot of ${r.events.length} parallel parking manoeuvres">`
    + layer('pen1', '1 cars', '#111', r.pen1, .25) + layer('pen2', '2 traces', ink2, r.pen2, .3) + text + extra + '</svg>';
}
