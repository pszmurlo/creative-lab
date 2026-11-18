// Brick Room rendering and parts helpers, shared by the viewer and the instruction booklet.

const shade = (hex, k) => { // k < 0 darkens, k > 0 lightens
  const n = parseInt(hex.slice(1), 16), ch = [n >> 16, n >> 8 & 255, n & 255];
  return `rgb(${ch.map(c => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)).join(',')})`;
};
const partName = b => `${Math.min(b.w, b.d)} × ${Math.max(b.w, b.d)} ${b.kind}`;

// Rotate the model a quarter turn `k` times; returns bricks in view space and the grid size
function viewBricks(m, k) {
  let W = m.w, D = m.d, out = m.bricks.map((b, i) => ({ ...b, i }));
  for (let t = 0; t < k; t++) {
    out = out.map(b => ({ ...b, x: D - (b.y + b.d), y: b.x, w: b.d, d: b.w }));
    [W, D] = [D, W];
  }
  return { bricks: out, W, D };
}

// Draw model `m` on a square canvas of `px` pixels. o: { view (quarter turns), all (finished model), zStep (height of the
// current step: later parts hidden, earlier ones faded), bg (background colour), show, fresh }
function drawModel(c, px, m, o) {
  const SIZE = 1000, { bricks, W, D } = viewBricks(m, o.view || 0);
  const zStep = o.zStep, last = o.all ? Infinity : zStep;
  // Optional o.show(b) / o.fresh(b) override which parts appear and which are highlighted (b.i is the part's index in m.bricks)
  const shown = o.show ? bricks.filter(o.show) : bricks.filter(b => b.z <= last);
  const fresh = o.fresh || (b => !o.all && b.z === zStep);

  // Occupancy: cell -> brick index, in plates
  const cell = new Map(), key = (x, y, z) => `${x},${y},${z}`;
  for (const b of shown) for (let x = b.x; x < b.x + b.w; x++) for (let y = b.y; y < b.y + b.d; y++) for (let z = b.z; z < b.z + b.h; z++) cell.set(key(x, y, z), b);
  let zMax = 0; for (const b of bricks) zMax = Math.max(zMax, b.z + b.h);

  // Projection: +x and +y come toward the viewer. A plate is 0.4 stud tall.
  const C = Math.cos(Math.PI / 6), PH = .4;
  const bw = (W + D) * C, bh = (W + D) * .5 + zMax * PH + .6;
  const s = Math.min(SIZE * .86 / bw, SIZE * .86 / bh);
  const ox = SIZE / 2 - (W - D) * C * s / 2, oy = (SIZE - bh * s) / 2 + (zMax * PH + .6) * s;
  const P = (x, y, z) => [ox + (x - y) * C * s, oy + (x + y) * .5 * s - z * PH * s];

  c.setTransform(px / SIZE, 0, 0, px / SIZE, 0, 0);
  c.fillStyle = o.bg || '#f4f2ed';
  c.fillRect(0, 0, SIZE, SIZE);
  // Baseplate footprint
  c.beginPath(); [P(0, 0, 0), P(W, 0, 0), P(W, D, 0), P(0, D, 0)].forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
  c.fillStyle = 'rgb(128 128 128 / .12)'; c.fill();

  const lw = Math.max(.6, s * .025);
  const face = (pts, fill, edges) => {
    c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    c.fillStyle = fill; c.fill();
    c.beginPath();
    edges.forEach((on, i) => { if (!on) return; const a = pts[i], b = pts[(i + 1) % 4]; c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
    c.strokeStyle = 'rgb(0 0 0 / .55)'; c.lineWidth = lw; c.stroke();
  };
  const same = (b, x, y, z) => cell.get(key(x, y, z)) === b;

  // Draw unit cells low to high, far to near
  const cells = [...cell.entries()].map(([k, b]) => { const [x, y, z] = k.split(',').map(Number); return { x, y, z, b }; });
  cells.sort((a, b) => a.z - b.z || (a.x + a.y) - (b.x + b.y) || a.x - b.x);
  for (const { x, y, z, b } of cells) {
    const hex = COLORS[b.c][1];
    const base = fresh(b) || o.all ? hex : null;
    const tone = k => base ? shade(hex, k) : shade(hex, k * .4 + .55); // earlier steps fade out
    // Top
    if (!cell.has(key(x, y, z + 1))) {
      face([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], tone(0),
           [!same(b, x, y - 1, z), !same(b, x + 1, y, z), !same(b, x, y + 1, z), !same(b, x - 1, y, z)]);
      // Stud, only on the top surface of a brick or plate (tiles are smooth)
      if (b.kind !== 'tile' && z === b.z + b.h - 1) {
        const [cx, cy] = P(x + .5, y + .5, z + 1), rx = .3 * s * C * Math.SQRT2, ry = .3 * s * .5 * Math.SQRT2, hh = .17 * s;
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); c.lineTo(cx - rx, cy - hh); c.ellipse(cx, cy - hh, rx, ry, 0, Math.PI, 0, true); c.closePath();
        c.fillStyle = tone(-.18); c.fill(); c.strokeStyle = 'rgb(0 0 0 / .4)'; c.lineWidth = lw * .8; c.stroke();
        c.beginPath(); c.ellipse(cx, cy - hh, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = tone(.12); c.fill(); c.stroke();
      }
    }
    // Side facing +x
    if (!cell.has(key(x + 1, y, z)))
      face([P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x + 1, y, z)], tone(-.16),
           [!same(b, x, y, z + 1), !same(b, x, y + 1, z), !same(b, x, y, z - 1), !same(b, x, y - 1, z)]);
    // Side facing +y
    if (!cell.has(key(x, y + 1, z)))
      face([P(x, y + 1, z + 1), P(x + 1, y + 1, z + 1), P(x + 1, y + 1, z), P(x, y + 1, z)], tone(-.32),
           [!same(b, x, y, z + 1), !same(b, x + 1, y, z), !same(b, x, y, z - 1), !same(b, x - 1, y, z)]);
  }
}

function partsList(list) {
  const map = new Map();
  for (const b of list) {
    const k = `${b.kind}|${Math.min(b.w, b.d)}x${Math.max(b.w, b.d)}|${b.c}`;
    const e = map.get(k) || { b, n: 0 }; e.n++; map.set(k, e);
  }
  return [...map.values()].sort((a, z) => a.b.kind.localeCompare(z.b.kind) || COLORS[a.b.c][0].localeCompare(COLORS[z.b.c][0]) || (a.b.w * a.b.d) - (z.b.w * z.b.d));
}
// Build steps: one per distinct starting height (plates)
const buildSteps = m => [...new Set(m.bricks.map(b => b.z))].sort((a, b) => a - b);
