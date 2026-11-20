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
    css: `.tape { width: 176px; height: 30px; box-sizing: border-box; border: 3px solid var(--ink); overflow: hidden; }
i { display: block; height: 100%; width: calc(100% + 40px); background: repeating-linear-gradient(-45deg, var(--acc) 0 10px, var(--ink) 10px 20px); animation: slide .6s linear infinite; }
@keyframes slide { to { transform: translateX(-28.284px); } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 2.4s; } }`
  },
  {
    day: 7, name: "Flip", added: "2026-11-20",
    note: "One square flips over its top edge, then its side, then back. Each half-turn swaps ink for red, so you can count the flips.",
    html: `<div class="f" role="progressbar" aria-label="Loading"><i></i></div>`,
    css: `.f { perspective: 220px; }
.f i { display: block; width: 56px; height: 56px; background: var(--ink); animation: flip 2.4s cubic-bezier(.7, 0, .3, 1) infinite; }
@keyframes flip {
  0%, 100% { transform: rotateX(0) rotateY(0); background: var(--ink); }
  25% { transform: rotateX(180deg) rotateY(0); background: var(--acc); }
  50% { transform: rotateX(180deg) rotateY(180deg); background: var(--ink); }
  75% { transform: rotateX(0) rotateY(180deg); background: var(--acc); }
}
@media (prefers-reduced-motion: reduce) { .f i { animation-duration: 9.6s; } }`
  },
  {
    day: 8, name: "Cradle", added: "2026-11-20",
    note: "Newton's cradle. Only the two end balls move: each swing eases out on the way up and accelerates on the way down, like a real pendulum.",
    html: `<div class="cr" role="progressbar" aria-label="Loading"><i></i><i></i><i></i><i></i><i></i></div>`,
    css: `.cr { display: flex; justify-content: center; width: 110px; border-top: 3px solid var(--ink); }
.cr i { position: relative; width: 18px; height: 64px; transform-origin: 50% 0; }
.cr i::before { content: ""; position: absolute; left: 50%; top: 0; width: 2px; height: 48px; margin-left: -1px; background: var(--ink); }
.cr i::after { content: ""; position: absolute; left: 0; bottom: 0; width: 18px; height: 18px; border-radius: 50%; background: var(--ink); }
.cr i:first-child::after, .cr i:last-child::after { background: var(--acc); }
.cr i:first-child { animation: out-l 1.2s infinite; }
.cr i:last-child { animation: out-r 1.2s infinite; }
@keyframes out-l { 0% { rotate: 0deg; animation-timing-function: cubic-bezier(.3, .6, .5, 1); } 25% { rotate: 30deg; animation-timing-function: cubic-bezier(.5, 0, .7, .4); } 50%, 100% { rotate: 0deg; } }
@keyframes out-r { 0%, 50% { rotate: 0deg; animation-timing-function: cubic-bezier(.3, .6, .5, 1); } 75% { rotate: -30deg; animation-timing-function: cubic-bezier(.5, 0, .7, .4); } 100% { rotate: 0deg; } }
@media (prefers-reduced-motion: reduce) { .cr i:first-child, .cr i:last-child { animation-duration: 4.8s; } }`
  },
  {
    day: 9, name: "Stack", added: "2026-11-20",
    note: "Four blocks fall into a tower with a gravity ease-in, hold, then slide off in the order they landed. The red one always lands last.",
    html: `<div class="st" role="progressbar" aria-label="Loading">${[0,1,2,3].map(i => `<i style="--i:${i}"></i>`).join("")}</div>`,
    css: `.st { position: relative; width: 84px; height: 92px; border-bottom: 3px solid var(--ink); }
.st i { position: absolute; left: 14px; bottom: calc(var(--i) * 22px + 2px); width: 56px; height: 20px; background: var(--ink); animation: drop 2.8s cubic-bezier(.55, 0, .85, .35) calc(var(--i) * .25s) infinite both; }
.st i:last-child { background: var(--acc); }
@keyframes drop {
  0% { transform: translateY(-48px); opacity: 0; }
  12% { transform: none; opacity: 1; animation-timing-function: linear; }
  70% { transform: none; opacity: 1; animation-timing-function: cubic-bezier(.5, 0, .75, 0); }
  82%, 100% { transform: translateX(36px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .st i { animation-duration: 11.2s; animation-delay: calc(var(--i) * 1s); } }`
  },
  {
    day: 10, name: "Clock", added: "2026-11-20",
    note: "A clock in fast-forward. The minute hand laps every 1.2s and the hour hand every 14.4s, so they keep the real 12:1 ratio.",
    html: `<div class="ck" role="progressbar" aria-label="Loading"><i class="h"></i><i class="m"></i></div>`,
    css: `.ck { position: relative; width: 84px; height: 84px; box-sizing: border-box; border: 4px solid var(--ink); border-radius: 50%; }
.ck i { position: absolute; left: 50%; bottom: 50%; background: var(--ink); transform-origin: 50% 100%; border-radius: 3px; }
.ck .m { width: 4px; height: 30px; margin-left: -2px; animation: turn 1.2s linear infinite; }
.ck .h { width: 6px; height: 20px; margin-left: -3px; animation: turn 14.4s linear infinite; }
.ck::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: var(--acc); }
@keyframes turn { to { rotate: 1turn; } }
@media (prefers-reduced-motion: reduce) { .ck .m { animation-duration: 4.8s; } .ck .h { animation-duration: 57.6s; } }`
  },
  {
    day: 11, name: "Segments", added: "2026-11-20",
    note: "Eight spokes share one fade. Each starts a tenth of a second after the one before, so a red head runs round with a fading tail.",
    html: `<div class="sg" role="progressbar" aria-label="Loading">${[0,1,2,3,4,5,6,7].map(i => `<i style="--i:${i}"></i>`).join("")}</div>`,
    css: `.sg { position: relative; width: 84px; height: 84px; }
.sg i { position: absolute; left: 50%; top: 0; width: 10px; height: 26px; margin-left: -5px; background: var(--ink); transform-origin: 50% 42px; rotate: calc(var(--i) * 45deg); animation: fade .8s linear calc(var(--i) * .1s - .8s) infinite; }
@keyframes fade { 0% { background: var(--acc); opacity: 1; } 15% { background: var(--ink); opacity: 1; } 100% { opacity: .15; } }
@media (prefers-reduced-motion: reduce) { .sg i { animation-duration: 3.2s; animation-delay: calc(var(--i) * .4s - 3.2s); } }`
  },
  {
    day: 12, name: "Equalizer", added: "2026-11-20",
    note: "Five bars bounce at five different speeds. Because the periods don't divide each other, the pattern takes a long time to repeat.",
    html: `<div class="eq" role="progressbar" aria-label="Loading">${[.5, .8, .6, .9, .7].map((t, i) => `<i style="--t:${t}; --d:${i * -.17}"></i>`).join("")}</div>`,
    css: `.eq { display: flex; align-items: flex-end; gap: 6px; height: 72px; }
.eq i { width: 14px; height: 100%; background: var(--ink); transform-origin: bottom; animation: lvl calc(var(--t) * 1s) ease-in-out calc(var(--d) * 1s) infinite alternate; }
.eq i:nth-child(3) { background: var(--acc); }
@keyframes lvl { from { transform: scaleY(.15); } to { transform: scaleY(1); } }
@media (prefers-reduced-motion: reduce) { .eq i { animation-duration: calc(var(--t) * 4s); animation-delay: calc(var(--d) * 4s); } }`
  },
  {
    day: 13, name: "Typewriter", added: "2026-11-20",
    note: "The word types out one character per step, waits, then backspaces. The width moves in ch units, which only lines up in a monospace font.",
    html: `<div class="tw" role="progressbar" aria-label="Loading"><span>LOADING</span><b></b></div>`,
    css: `.tw { display: flex; align-items: center; gap: 2px; width: calc(7ch + 16px); font: 700 26px/1 "Space Mono", ui-monospace, monospace; letter-spacing: 0; color: var(--ink); }
.tw span { width: 7ch; overflow: hidden; white-space: nowrap; animation: type 3s infinite; }
.tw b { width: 14px; height: 28px; background: var(--acc); animation: blink .5s steps(1) infinite alternate; }
@keyframes type {
  0% { width: 0; animation-timing-function: steps(7, end); }
  50% { width: 7ch; }
  85% { width: 7ch; animation-timing-function: steps(7, end); }
  100% { width: 0; }
}
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tw span { animation-duration: 12s; } .tw b { animation-duration: 2s; } }`
  },
  {
    day: 14, name: "Morph", added: "2026-11-20",
    note: "A square turns into a circle, a leaf and back while it rotates. Only border-radius, rotate and scale change, so it stays one element.",
    html: `<div class="mo" role="progressbar" aria-label="Loading"><i></i></div>`,
    css: `.mo i { display: block; width: 56px; height: 56px; background: var(--ink); animation: morph 3.2s cubic-bezier(.65, 0, .35, 1) infinite; }
@keyframes morph {
  0% { border-radius: 0; rotate: 0deg; scale: 1; background: var(--ink); }
  25% { border-radius: 50%; rotate: 90deg; scale: .8; background: var(--acc); }
  50% { border-radius: 50% 0; rotate: 180deg; scale: 1; background: var(--ink); }
  75% { border-radius: 0 50%; rotate: 270deg; scale: .8; background: var(--acc); }
  100% { border-radius: 0; rotate: 360deg; scale: 1; background: var(--ink); }
}
@media (prefers-reduced-motion: reduce) { .mo i { animation-duration: 12.8s; } }`
  }
];
