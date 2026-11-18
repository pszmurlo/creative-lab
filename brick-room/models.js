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
      const free = (u, v) => { const [x, y] = along ? [u, v] : [v, u]; return !hole(x0 + x, y0 + y, li); }; // hole() gets model coordinates
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

/* ---------- Flat: whole apartment, from a floor plan (version 3 layout) ---------- */
// Scale 1 stud ≈ 20 cm. Walls are cut at about 1.2 m, like an architect's model, so the rooms stay visible.
{
  const m = new Model('Flat', 36, 39, 'A whole apartment from its floor plan: bathroom, bedroom with a work corner, hall, kitchen with island, living room. 1 stud ≈ 20 cm.');
  m.base = '48 × 48';
  const WALL = 5; // bricks
  const wall = (x, y, w, d, hole = () => false, c = 'white') => m.fill(x, y, 1, w, d, WALL, c, { hole });
  const window_ = (lo, hi, axis) => (x, y, l) => l >= 1 && (axis === 'x' ? x : y) >= lo && (axis === 'x' ? x : y) <= hi;
  const door = (lo, hi, axis) => (x, y) => (axis === 'x' ? x : y) >= lo && (axis === 'x' ? x : y) <= hi;

  // Floor: oak everywhere, grey tiles in the bathroom
  m.fill(0, 0, 0, 36, 39, 1, 'tan', { kind: 'plate', hole: (x, y) => x >= 1 && x <= 15 && y >= 1 && y <= 8 });
  m.fill(1, 1, 0, 15, 8, 1, 'lightgray', { kind: 'plate' });

  // Outer walls: entrance on the left, bedroom window and balcony door on the right, living-room window at the bottom
  wall(0, 0, 36, 1);
  wall(0, 1, 1, 37, door(14, 17, 'y'));
  wall(35, 1, 1, 37, (x, y, l) => window_(4, 13, 'y')(x, y, l) || (y >= 23 && y <= 27) || window_(28, 37, 'y')(x, y, l));
  wall(0, 38, 36, 1, window_(22, 34, 'x'));

  // Inner walls
  wall(1, 9, 15, 1, door(7, 10, 'x'));        // bathroom | hall
  wall(16, 1, 1, 14);                          // bathroom + hall | bedroom
  wall(17, 15, 18, 1, door(17, 20, 'x'));     // bedroom | living room
  m.fill(19, 16, 1, 12, 1, WALL, 'black');      // acoustic slat panel on the living-room side

  // Bathroom
  m.fill(1, 1, 1, 3, 3, WALL, 'white');                                        // service shaft
  m.fill(2, 5, 1, 2, 3, 1, 'white');                                           // toilet
  m.fill(7, 1, 1, 4, 2, 3, 'white'); m.fill(8, 1, 10, 2, 2, 1, 'lightblue', { kind: 'tile' }); // vanity + basin
  m.fill(12, 1, 1, 4, 8, 2, 'white', { hole: (x, y, l) => l === 1 && x >= 13 && x <= 14 && y >= 2 && y <= 7 }); // bath
  m.fill(13, 2, 4, 2, 6, 1, 'lightblue', { kind: 'tile' });                    // water

  // Hall
  m.fill(1, 10, 1, 5, 3, 2, 'darktan');                                        // shoe cabinet
  m.fill(4, 22, 1, 3, 4, 4, 'darktan');                                        // niche cabinet
  m.fill(9, 22, 1, 7, 4, WALL, 'darktan');                                     // wardrobe

  // Bedroom
  m.fill(17, 1, 1, 3, 8, WALL, 'lightgray');                                   // wardrobe
  m.fill(22, 2, 1, 8, 9, 1, 'darkgray');                                       // bed frame
  m.fill(22, 2, 4, 8, 1, 2, 'darkgray');                                       // headboard
  m.fill(22, 3, 4, 8, 8, 1, 'white');                                          // mattress
  m.fill(22, 3, 7, 8, 2, 1, 'lightgray', { kind: 'tile' });                    // pillows
  m.fill(22, 6, 7, 8, 5, 1, 'sandgreen', { kind: 'plate' });                   // duvet
  for (const x of [20, 30]) { m.fill(x, 2, 1, 2, 2, 2, 'darktan'); m.fill(x, 2, 7, 1, 1, 1, 'yellow'); } // night stands + lamps
  m.fill(32, 1, 1, 3, 2, 3, 'lightgray');                                      // dresser
  // Work corner: desk on black legs, chair, slat panels around it
  for (const [x, y] of [[32, 9], [34, 9], [32, 14], [34, 14]]) m.fill(x, y, 1, 1, 1, 3, 'black');
  m.fill(32, 9, 10, 3, 6, 1, 'darktan', { kind: 'plate' });
  m.fill(32, 9, 11, 3, 6, 1, 'darktan', { kind: 'plate' });
  m.fill(33, 11, 12, 1, 3, 2, 'black');                                        // screen
  m.fill(30, 11, 1, 2, 2, 2, 'black'); m.fill(29, 11, 1, 1, 2, 4, 'black');    // chair + back

  // Kitchen: dark lower units, black worktop, island with two stools
  m.fill(1, 19, 1, 3, 4, WALL, 'darkgray');                                    // fridge column
  m.fill(1, 23, 1, 3, 4, WALL, 'darkgray');                                    // oven column
  m.fill(1, 27, 1, 3, 11, 4, 'darkgray'); m.fill(1, 27, 13, 3, 11, 1, 'black', { kind: 'plate' });
  m.fill(4, 35, 1, 9, 3, 4, 'darkgray'); m.fill(4, 35, 13, 9, 3, 1, 'black', { kind: 'plate' });
  m.fill(1, 30, 14, 3, 3, 1, 'darkgray', { kind: 'tile' });                    // hob
  m.fill(7, 35, 14, 2, 2, 1, 'lightgray', { kind: 'tile' });                   // sink
  m.fill(13, 30, 1, 4, 8, 4, 'darkgray'); m.fill(13, 30, 13, 4, 8, 1, 'black', { kind: 'plate' }); // island
  for (const y of [31, 34]) { m.fill(18, y, 1, 1, 1, 3, 'black'); m.fill(18, y, 10, 2, 2, 1, 'darktan', { kind: 'plate' }); } // stools

  // Living room: TV on a low unit in front of the slats, corner sofa by the windows
  m.fill(21, 17, 1, 8, 2, 1, 'darkgray');                                      // TV unit
  m.fill(22, 17, 4, 6, 1, 2, 'black');                                         // TV
  m.fill(22, 33, 1, 13, 5, 1, 'lightgray'); m.fill(22, 37, 4, 13, 1, 2, 'lightgray');  // sofa, long side + back
  m.fill(30, 28, 1, 5, 5, 1, 'lightgray'); m.fill(34, 28, 4, 1, 9, 2, 'lightgray');    // sofa, short side + back
  m.fill(22, 33, 4, 12, 4, 1, 'white', { kind: 'plate' }); m.fill(30, 28, 4, 4, 5, 1, 'white', { kind: 'plate' }); // cushions
  m.fill(24, 24, 1, 4, 4, 1, 'darktan'); m.fill(24, 24, 4, 4, 4, 1, 'black', { kind: 'tile' }); // coffee table
  MODELS.push(m);
}
