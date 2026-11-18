// Brick models. Units: x, y in studs; z in plates (a brick is 3 plates tall).
// To add a room, describe it to Claude: it writes a new entry with the same helpers.

const COLORS = {
  white: ['White', '#f4f4f4'], lightgray: ['Light gray', '#a0a5a9'], darkgray: ['Dark gray', '#6c6e68'],
  black: ['Black', '#1b2a34'], red: ['Red', '#c91a09'], yellow: ['Yellow', '#f2cd37'], blue: ['Blue', '#0055bf'],
  darkblue: ['Dark blue', '#0a3463'], green: ['Green', '#237841'], lime: ['Lime', '#bbe90b'], tan: ['Tan', '#e4cd9e'],
  darktan: ['Dark tan', '#958a73'], brown: ['Brown', '#583927'], orange: ['Orange', '#fe8a18'],
  sandgreen: ['Sand green', '#a0bcac'], pink: ['Pink', '#fc97ac'], lightblue: ['Light blue', '#9fc3e9'],
};
const HEIGHT = { brick: 3, plate: 1, tile: 1 };
const LENGTHS = [8, 6, 4, 3, 2, 1];

class Model {
  constructor(name, w, d, note) { Object.assign(this, { name, w, d, note, bricks: [] }); }
  add(x, y, z, w, d, c, kind = 'brick') { this.bricks.push({ x, y, z, w, d, h: HEIGHT[kind], c, kind }); return this; }

  // Fill a box with standard parts, `layers` high. Runs go along the longer side, two studs deep where possible,
  // and every other layer starts with a 2-long piece so seams don't line up (the build holds together).
  // hole(x, y, layer) -> true leaves that cell empty (windows, doors).
  fill(x0, y0, z0, w, d, layers, c, { kind = 'brick', hole = () => false } = {}) {
    const along = w >= d; // runs along x when the box is wider than deep
    const L = along ? w : d, D = along ? d : w;
    for (let li = 0; li < layers; li++) {
      const z = z0 + li * HEIGHT[kind];
      const free = (u, v) => { const [x, y] = along ? [u, v] : [v, u]; return !hole(x, y, li); };
      const used = new Set();
      for (let v = 0; v < D; v += 2) {
        const depth2 = v + 1 < D;
        // Two-deep runs where both rows are free, then single-row leftovers
        for (const deep of depth2 ? [2, 1] : [1]) for (const row of deep === 2 ? [v] : depth2 ? [v, v + 1] : [v]) {
          let u = 0;
          while (u < L) {
            const ok = uu => !used.has(`${uu},${row}`) && free(uu, row) && (deep === 1 || (!used.has(`${uu},${row + 1}`) && free(uu, row + 1)));
            if (!ok(u)) { u++; continue; }
            let end = u; while (end < L && ok(end)) end++;
            for (const [s, len] of split(u, end - u, li % 2 === 1)) {
              for (let k = s; k < s + len; k++) for (let r = 0; r < deep; r++) used.add(`${k},${row + r}`);
              const [bx, by, bw, bd] = along ? [x0 + s, y0 + row, len, deep] : [x0 + row, y0 + s, deep, len];
              this.add(bx, by, z, bw, bd, c, kind);
            }
            u = end;
          }
        }
      }
    }
    return this;
  }
}
// Split a run into stock lengths; odd layers lead with a 2 so joints are staggered
function split(start, len, odd) {
  const out = []; let s = start, left = len;
  if (odd && left >= 4) { out.push([s, 2]); s += 2; left -= 2; }
  while (left > 0) {
    const n = LENGTHS.find(l => l <= left && (left - l !== 1 || left === 1)); // never leave a lone 1×1 at the end
    out.push([s, n]); s += n; left -= n;
  }
  return out;
}

const MODELS = [];

/* ---------- Desk corner: a 20 × 16 room corner ---------- */
{
  const m = new Model('Desk corner', 20, 16, 'A work corner: desk, screen, lamp, chair, bookshelf, plant and a rug. About 20 × 16 cm on the table.');
  m.fill(0, 0, 0, 20, 16, 1, 'tan', { kind: 'plate' });                            // floor
  m.fill(0, 0, 1, 20, 1, 10, 'white', { hole: (x, y, l) => x >= 6 && x <= 11 && l >= 3 && l <= 7 }); // back wall with window
  m.fill(6, 0, 10, 6, 1, 1, 'lightblue', { kind: 'plate' });                       // window sill
  m.fill(0, 1, 1, 1, 15, 10, 'white');                                             // left wall
  m.fill(10, 7, 1, 7, 6, 1, 'darkblue', { kind: 'tile' });                         // rug

  for (const [x, y] of [[3, 1], [12, 1], [3, 5], [12, 5]]) m.fill(x, y, 1, 1, 1, 6, 'darkgray'); // desk legs
  m.fill(3, 1, 19, 10, 5, 1, 'brown', { kind: 'plate' });                          // desk top, lower layer
  for (let x = 3; x < 13; x += 2) m.fill(x, 1, 20, 2, 5, 1, 'brown', { kind: 'plate' }); // upper layer crosses it so the top holds together
  m.fill(7, 2, 21, 1, 1, 1, 'darkgray');                                           // monitor stand
  m.fill(5, 2, 24, 5, 1, 4, 'black');                                              // monitor
  m.fill(6, 4, 21, 4, 1, 1, 'lightgray', { kind: 'tile' });                        // keyboard
  m.fill(10, 4, 21, 1, 1, 1, 'lightgray', { kind: 'tile' });                       // mouse
  m.fill(4, 4, 21, 1, 1, 1, 'red');                                                // mug
  m.fill(11, 2, 21, 1, 1, 2, 'darkgray');                                          // lamp pole
  m.fill(10, 2, 27, 2, 2, 1, 'yellow');                                            // lamp head

  for (const [x, y] of [[7, 7], [9, 7], [7, 9], [9, 9]]) m.fill(x, y, 1, 1, 1, 3, 'darkgray'); // chair legs
  m.fill(7, 7, 10, 3, 3, 1, 'blue', { kind: 'plate' });                            // seat
  m.fill(7, 9, 11, 3, 1, 4, 'blue');                                               // back rest

  m.fill(2, 9, 1, 1, 1, 5, 'darktan'); m.fill(2, 13, 1, 1, 1, 5, 'darktan');       // shelf posts
  m.fill(1, 9, 16, 2, 5, 1, 'darktan', { kind: 'plate' });                         // shelf
  ['red', 'yellow', 'sandgreen', 'blue', 'orange'].forEach((c, i) => m.fill(1, 9 + i, 17, 1, 1, i % 2 ? 2 : 1, c)); // books

  m.fill(16, 1, 1, 2, 2, 2, 'orange');                                             // pot
  m.fill(16, 1, 7, 2, 2, 2, 'green');                                              // leaves
  m.fill(16, 1, 13, 1, 1, 1, 'lime'); m.fill(17, 2, 13, 1, 1, 1, 'lime');
  MODELS.push(m);
}
