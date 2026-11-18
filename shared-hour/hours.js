// Shared-hour maths for pages that read Shared Hour's saved people (localStorage 'shared-hour').
// Used by Morning Slip and Desk Display; Shared Hour itself has a fuller version for its dial.
(() => {
  // Minutes a zone is ahead of UTC right now
  function offset(zone, at = new Date()) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
      .formatToParts(at).map(x => [x.type, x.value]));
    return Math.round((Date.UTC(+p.year, p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(at.getTime() / 60000) * 60000) / 60000);
  }
  const awake = (p, m) => { const h = ((m % 1440) + 1440) % 1440 / 60; return p.s > p.w ? h >= p.w && h < p.s : h >= p.w || h < p.s; };

  // { names, windows: [[startMin, endMin], ...] in your local day (end may pass 1440), nowMin, current, next } or null
  window.sharedHours = function (people) {
    if (!people) { try { people = JSON.parse(localStorage.getItem('shared-hour')) || []; } catch { people = []; } }
    if (people.length < 2) return null;
    const me = offset(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const rel = people.map(p => { try { return offset(p.z) - me; } catch { return 0; } });
    const all = Array.from({ length: 1440 }, (_, m) => people.every((p, i) => awake(p, m + rel[i])));
    const windows = []; let s = -1;
    for (let m = 0; m <= 1440; m++) { const on = m < 1440 && all[m]; if (on && s < 0) s = m; else if (!on && s >= 0) { windows.push([s, m]); s = -1; } }
    if (windows.length > 1 && windows[0][0] === 0 && windows.at(-1)[1] === 1440) { const f = windows.shift(); windows.at(-1)[1] = 1440 + f[1]; }
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    const inside = w => (nowMin >= w[0] && nowMin < w[1]) || (nowMin + 1440 >= w[0] && nowMin + 1440 < w[1]);
    const current = windows.find(inside) || null;
    let next = null, wait = Infinity;
    for (const w of windows) { const d = (w[0] - nowMin + 1440) % 1440; if (!inside(w) && d < wait) { wait = d; next = w; } }
    return { names: people.map(p => p.n), windows, nowMin, current, left: current ? (current[1] - nowMin + 1440) % 1440 || 1440 : 0, next, wait: next ? wait : 0 };
  };
})();
