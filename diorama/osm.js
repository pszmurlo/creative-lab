// Shared OpenStreetMap loader: OpenFreeMap vector tiles -> buildings, roads, water and green areas
// in local metres around a point (x east, y north). Used by Street Diorama and City Score.

/* ---------- Mapbox Vector Tile decoder (just what this page needs) ---------- */
class Pbf {
  constructor(buf) { this.b = new Uint8Array(buf); this.p = 0; }
  varint() { let r = 0, m = 1, c; do { c = this.b[this.p++]; r += (c & 0x7f) * m; m *= 128; } while (c & 0x80); return r; }
  svarint() { const n = this.varint(); return n % 2 ? -(n + 1) / 2 : n / 2; }
  bytes() { const len = this.varint(), s = this.p; this.p += len; return this.b.subarray(s, this.p); }
  str() { return new TextDecoder().decode(this.bytes()); }
  skip(w) { if (w === 0) this.varint(); else if (w === 1) this.p += 8; else if (w === 2) this.p += this.varint(); else if (w === 5) this.p += 4; }
  packed() { const end = this.varint() + this.p, out = []; while (this.p < end) out.push(this.varint()); return out; }
}
function decodeValue(bytes) {
  const r = new Pbf(bytes); let v = null;
  while (r.p < r.b.length) {
    const t = r.varint(), f = t >> 3, w = t & 7;
    if (f === 1) v = r.str();
    else if (f === 2) { v = new DataView(r.b.buffer, r.b.byteOffset + r.p, 4).getFloat32(0, true); r.p += 4; }
    else if (f === 3) { v = new DataView(r.b.buffer, r.b.byteOffset + r.p, 8).getFloat64(0, true); r.p += 8; }
    else if (f === 4 || f === 5) v = r.varint();
    else if (f === 6) v = r.svarint();
    else if (f === 7) v = !!r.varint();
    else r.skip(w);
  }
  return v;
}
// Returns { layerName: { extent, features: [{ type, props, geom: [[ [x,y], ... ], ...] }] } }
function decodeTile(buf, wanted) {
  const r = new Pbf(buf), layers = {};
  while (r.p < r.b.length) {
    const t = r.varint();
    if ((t >> 3) !== 3) { r.skip(t & 7); continue; }
    const lr = new Pbf(r.bytes());
    let name = '', extent = 4096; const keys = [], vals = [], feats = [];
    while (lr.p < lr.b.length) {
      const lt = lr.varint(), f = lt >> 3;
      if (f === 1) name = lr.str();
      else if (f === 2) feats.push(lr.bytes());
      else if (f === 3) keys.push(lr.str());
      else if (f === 4) vals.push(decodeValue(lr.bytes()));
      else if (f === 5) extent = lr.varint();
      else lr.skip(lt & 7);
    }
    if (!wanted.has(name)) continue;
    layers[name] = { extent, features: feats.map(fb => {
      const fr = new Pbf(fb); let tags = [], type = 0, geo = [];
      while (fr.p < fr.b.length) {
        const ft = fr.varint(), f = ft >> 3;
        if (f === 2) tags = fr.packed(); else if (f === 3) type = fr.varint(); else if (f === 4) geo = fr.packed(); else fr.skip(ft & 7);
      }
      const props = {}; for (let i = 0; i < tags.length; i += 2) props[keys[tags[i]]] = vals[tags[i + 1]];
      const rings = []; let x = 0, y = 0, ring = null;
      for (let i = 0; i < geo.length;) {
        const c = geo[i++], id = c & 7, n = c >> 3;
        if (id === 7) { if (ring) ring.closed = true; continue; }
        for (let k = 0; k < n; k++) {
          x += zz(geo[i++]); y += zz(geo[i++]);
          if (id === 1) { ring = []; rings.push(ring); }
          ring.push([x, y]);
        }
      }
      return { type, props, rings };
    }) };
  }
  return layers;
}
function zz(n) { return n % 2 ? -(n + 1) / 2 : n / 2; }

/* ---------- Geometry helpers ---------- */
const area = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]); return a / 2; }; // >0 = CCW (y up)
// Sutherland–Hodgman against an axis-aligned rect
function clipPoly(ring, x0, y0, x1, y1) {
  const edges = [[p => p[0] >= x0, (a, b) => lerpX(a, b, x0)], [p => p[0] <= x1, (a, b) => lerpX(a, b, x1)],
                 [p => p[1] >= y0, (a, b) => lerpY(a, b, y0)], [p => p[1] <= y1, (a, b) => lerpY(a, b, y1)]];
  let out = ring;
  for (const [inside, cut] of edges) {
    if (!out.length) break;
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[(i + inp.length - 1) % inp.length], b = inp[i];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
  }
  return out;
}
const lerpX = (a, b, x) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])];
const lerpY = (a, b, y) => [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y];
// Liang–Barsky for one segment
function clipSeg(a, b, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1; const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return null; if (t > t0) t0 = t; } else { if (t < t0) return null; if (t < t1) t1 = t; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
}

/* ---------- Data: tiles around a point, in local metres (x east, y north) ---------- */
const Z = 14;
let TILE_URL = null;
const tileCache = new Map();
async function tileTemplate() {
  if (TILE_URL) return TILE_URL;
  const tj = await (await fetch('https://tiles.openfreemap.org/planet')).json();
  return (TILE_URL = tj.tiles[0]);
}
const lon2t = lon => (lon + 180) / 360 * 2 ** Z;
const lat2t = lat => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** Z;
const t2lon = x => x / 2 ** Z * 360 - 180;
const t2lat = y => { const n = Math.PI - 2 * Math.PI * y / 2 ** Z; return 180 / Math.PI * Math.atan(Math.sinh(n)); };

async function loadArea(lat, lon, R) {
  const mx = 111320 * Math.cos(lat * Math.PI / 180), my = 110574;
  const toLocal = (lo, la) => [(lo - lon) * mx, (la - lat) * my];
  const pad = R * 1.05;
  const tx0 = Math.floor(lon2t(lon - pad / mx)), tx1 = Math.floor(lon2t(lon + pad / mx));
  const ty0 = Math.floor(lat2t(lat + pad / my)), ty1 = Math.floor(lat2t(lat - pad / my));
  const url = await tileTemplate();
  const jobs = [];
  for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) {
    const key = `${tx}/${ty}`;
    if (!tileCache.has(key)) tileCache.set(key, fetch(url.replace('{z}', Z).replace('{x}', tx).replace('{y}', ty))
      .then(r => { if (!r.ok) throw new Error(`tile ${key}: HTTP ${r.status}`); return r.arrayBuffer(); })
      .then(b => decodeTile(b, new Set(['building', 'transportation', 'water', 'park', 'landcover'])))
      .catch(e => { tileCache.delete(key); throw e; }));
    jobs.push(tileCache.get(key).then(layers => ({ tx, ty, layers })));
  }
  const tiles = await Promise.all(jobs);

  const out = { buildings: [], roads: [], water: [], green: [], R };
  for (const { tx, ty, layers } of tiles) {
    // This tile's exact bounds in local metres, intersected with the cut-out square
    const [bx0, by1] = toLocal(t2lon(tx), t2lat(ty)), [bx1, by0] = toLocal(t2lon(tx + 1), t2lat(ty + 1));
    const cx0 = Math.max(bx0, -R), cx1 = Math.min(bx1, R), cy0 = Math.max(by0, -R), cy1 = Math.min(by1, R);
    if (cx0 >= cx1 || cy0 >= cy1) continue;
    // Sides that are tile seams (not the diorama's own cut): edges along them are not drawn
    const seams = { x: [bx0 > -R && bx0, bx1 < R && bx1].filter(v => v !== false), y: [by0 > -R && by0, by1 < R && by1].filter(v => v !== false) };
    const proj = (layer, f) => f.rings.map(r => r.map(([px, py]) => toLocal(t2lon(tx + px / layer.extent), t2lat(ty + py / layer.extent))));

    const polys = (layer, cb) => {
      if (!layer) return;
      for (const f of layer.features) {
        if (f.type !== 3) continue;
        // Split rings into polygons: an exterior ring starts a new polygon (y-down tile coords: exterior has positive area)
        const local = proj(layer, f), polys = [];
        f.rings.forEach((r, i) => { if (area(r) > 0 || !polys.length) polys.push([local[i]]); else polys.at(-1).push(local[i]); });
        for (const p of polys) {
          const outer = clipPoly(p[0], cx0, cy0, cx1, cy1);
          if (outer.length < 3) continue;
          const rings = [outer, ...p.slice(1).map(r => clipPoly(r, cx0, cy0, cx1, cy1)).filter(r => r.length >= 3)];
          // Exterior CCW, holes CW (y up), so one outward-normal rule works for every wall
          rings.forEach((r, i) => { const a = area(r); if ((i === 0) !== (a > 0)) r.reverse(); });
          cb(rings, f.props);
        }
      }
    };
    polys(layers.building, (rings, p) => {
      if (p.hide_3d) return;
      const h = +p.render_height || 6, mh = +p.render_min_height || 0;
      let cx = 0, cy = 0; for (const [x, y] of rings[0]) { cx += x; cy += y; }
      out.buildings.push({ rings, h, mh, cx: cx / rings[0].length, cy: cy / rings[0].length, seams });
    });
    polys(layers.water, rings => out.water.push(rings));
    polys(layers.park, rings => out.green.push(rings));
    polys(layers.landcover, (rings, p) => { if (['grass', 'wood', 'farmland', 'wetland'].includes(p.class)) out.green.push(rings); });
    const tr = layers.transportation;
    if (tr) for (const f of tr.features) {
      if (f.type !== 2 || f.props.brunnel === 'tunnel') continue;
      for (const line of proj(tr, f)) for (let i = 1; i < line.length; i++) {
        const s = clipSeg(line[i - 1], line[i], cx0, cy0, cx1, cy1);
        if (s) out.roads.push({ a: s[0], b: s[1], cls: f.props.class });
      }
    }
  }
  return out;
}
