// One loader a day. Add the next one at the end: {day, name, note, html, css}.
// Each loader is role="progressbar" and slows down (not stops) under prefers-reduced-motion.
// Colors come from the page: var(--ink), var(--acc), var(--bg). Fonts: Anton, Space Mono.
window.LOADERS = [
  {
    day: 1, name: "Braille", added: "2026-11-18",
    note: "A ten-frame braille spinner. The glyphs sit in one column and steps() jumps the column up one line per frame.",
    html: `<div class="row" role="progressbar" aria-label="Loading"><div class="win"><div class="strip">⠋<br>⠙<br>⠹<br>⠸<br>⠼<br>⠴<br>⠦<br>⠧<br>⠇<br>⠏</div></div><span class="t">loading</span></div>`,
    css: `.row { display: flex; align-items: center; gap: 14px; }
.win { height: 1em; overflow: hidden; font: 700 64px/1 "Space Mono", monospace; color: var(--acc); }
.strip { animation: frames .8s steps(10) infinite; }
.t { font: 700 15px "Space Mono", monospace; color: var(--ink); text-transform: uppercase; letter-spacing: .15em; }
@keyframes frames { to { transform: translateY(-10em); } }
@media (prefers-reduced-motion: reduce) { .strip { animation-duration: 3.2s; } }`
  },
  {
    day: 2, name: "Chunk bar", added: "2026-11-18",
    note: "A progress bar that fills in eight hard steps, holds full for a beat, then starts again.",
    html: `<div class="bar" role="progressbar" aria-label="Loading"><i></i></div>`,
    css: `.bar { width: 200px; height: 28px; border: 3px solid var(--ink); padding: 3px; box-sizing: border-box; }
i { display: block; height: 100%; background: var(--ink); transform-origin: left; animation: fill 2.4s steps(8, jump-none) infinite; }
@keyframes fill { from { transform: scaleX(0); } 75%, to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 6s; } }`
  },
  {
    day: 3, name: "Wave grid", added: "2026-11-18",
    note: "Nine squares shrink and flash in turn. Each square's delay is its row plus its column, so the wave runs diagonally.",
    html: `<div class="g" role="progressbar" aria-label="Loading">${[0,1,2,1,2,3,2,3,4].map(d => `<i style="--d:${d}"></i>`).join("")}</div>`,
    css: `.g { display: grid; grid-template-columns: repeat(3, 22px); gap: 5px; }
i { width: 22px; height: 22px; background: var(--ink); animation: pulse 1.2s ease-in-out calc(var(--d) * .1s) infinite; }
@keyframes pulse { 50% { scale: .35; background: var(--acc); } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 4.8s; animation-delay: calc(var(--d) * .4s); } }`
  },
  {
    day: 4, name: "Jump", added: "2026-11-18",
    note: "Each letter hops after the one before it. Most of the cycle is rest, which keeps the jumps readable.",
    html: `<div class="w" role="progressbar" aria-label="Loading">${[..."LOADING"].map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>`,
    css: `.w { display: flex; font: 400 44px/1 "Anton", Impact, sans-serif; color: var(--ink); }
span { display: inline-block; animation: hop 1.4s cubic-bezier(.3, 0, .3, 1) calc(var(--i) * .08s) infinite; }
@keyframes hop { 0%, 30%, 100% { transform: none; color: var(--ink); } 15% { transform: translateY(-16px); color: var(--acc); } }
@media (prefers-reduced-motion: reduce) { span { animation-duration: 5.6s; animation-delay: calc(var(--i) * .32s); } }`
  },
  {
    day: 5, name: "Orbit", added: "2026-11-18",
    note: "Three dots share one orbit with eased rotation. Small delays make them bunch up and spread out each lap.",
    html: `<div class="o" role="progressbar" aria-label="Loading"><i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i></div>`,
    css: `.o { width: 80px; height: 80px; position: relative; }
i { position: absolute; inset: 0; animation: spin 1.4s cubic-bezier(.6, .1, .4, .9) calc(var(--i) * .12s) infinite; }
i::before { content: ""; position: absolute; top: 0; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: var(--ink); }
i:first-child::before { background: var(--acc); }
@keyframes spin { to { rotate: 1turn; } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 5.6s; animation-delay: calc(var(--i) * .48s); } }`
  },
  {
    day: 6, name: "Hazard tape", added: "2026-11-18",
    note: "Diagonal stripes slide forever. The strip moves exactly one stripe period (20px × √2 for 45°), so the loop has no seam.",
    html: `<div class="tape" role="progressbar" aria-label="Loading"><i></i></div>`,
    css: `.tape { width: 220px; height: 30px; border: 3px solid var(--ink); overflow: hidden; }
i { display: block; height: 100%; width: calc(100% + 40px); background: repeating-linear-gradient(-45deg, var(--acc) 0 10px, var(--ink) 10px 20px); animation: slide .6s linear infinite; }
@keyframes slide { to { transform: translateX(-28.284px); } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 2.4s; } }`
  }
];
