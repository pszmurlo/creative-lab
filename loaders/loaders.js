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
    css: `.bar { width: 176px; height: 28px; border: 3px solid var(--ink); padding: 3px; box-sizing: border-box; }
i { display: block; height: 100%; background: var(--ink); transform-origin: left; animation: fill 2.4s steps(8, jump-none) infinite; }
@keyframes fill { from { transform: scaleX(0); } 75%, to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { i { animation-duration: 9.6s; } }`
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
.tw span { width: 7ch; overflow: hidden; white-space: nowrap; animation: type 3s -1.5s infinite; }
.tw b { width: 14px; height: 28px; background: var(--acc); animation: blink .5s steps(1) infinite alternate; }
@keyframes type {
  0% { width: 0; animation-timing-function: steps(7, end); }
  50% { width: 7ch; }
  85% { width: 7ch; animation-timing-function: steps(7, end); }
  100% { width: 0; }
}
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tw span { animation-duration: 12s; animation-delay: -6s; } .tw b { animation-duration: 2s; } }`
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
  },
  {
    day: 15, name: "Bounce", added: "2026-11-20",
    note: "A ball drops with an ease-in, squashes flat for a moment on the floor, then rises with an ease-out. The squash is what sells the weight.",
    html: `<div class="bo" role="progressbar" aria-label="Loading"><i></i></div>`,
    css: `.bo { position: relative; width: 80px; height: 104px; border-bottom: 4px solid var(--ink); }
.bo i { position: absolute; left: 50%; bottom: 0; width: 30px; height: 30px; margin-left: -15px; border-radius: 50%; background: var(--acc); transform-origin: 50% 100%; animation: bounce .9s infinite; }
@keyframes bounce {
  0%, 100% { translate: 0 -68px; scale: 1; animation-timing-function: cubic-bezier(.55, 0, 1, .45); }
  44% { translate: 0 0; scale: 1; animation-timing-function: linear; }
  50% { translate: 0 0; scale: 1.35 .65; animation-timing-function: linear; }
  56% { translate: 0 0; scale: 1; animation-timing-function: cubic-bezier(0, .55, .45, 1); }
}
@media (prefers-reduced-motion: reduce) { .bo i { animation-duration: 3.6s; } }`
  },
  {
    day: 16, name: "Tally", added: "2026-11-20",
    note: "Four strokes and a red strike, drawn one at a time, then wiped. Each mark gets its own keyframes so they can all be erased together.",
    html: `<div class="ty" role="progressbar" aria-label="Loading"><i></i><i></i><i></i><i></i><b></b></div>`,
    css: `.ty { position: relative; display: flex; gap: 10px; height: 64px; padding: 0 6px; }
.ty i { width: 6px; height: 100%; background: var(--ink); transform-origin: 50% 0; --s0: 1 0; }
.ty b { position: absolute; left: 0; top: 50px; width: 72px; height: 6px; background: var(--acc); transform-origin: 0 50%; rotate: -34deg; --s0: 0 1; }
.ty > * { animation: 3.2s cubic-bezier(.3, 0, .2, 1) -1.9s infinite; }
${[0,1,2,3,4].map(k => `.ty > :nth-child(${k + 1}) { animation-name: m${k}; }
@keyframes m${k} { 0%, ${6 + k * 9}% { scale: var(--s0); opacity: 1; } ${12 + k * 9}%, 80% { scale: 1; opacity: 1; } 88%, 100% { scale: 1; opacity: 0; } }`).join("\n")}
@media (prefers-reduced-motion: reduce) { .ty > * { animation-duration: 12.8s; animation-delay: -7.6s; } }`
  },
  {
    day: 17, name: "Ripple", added: "2026-11-20",
    note: "Three rings leave the centre a third of a cycle apart. Each grows fast and fades slowly, like a drop landing in water.",
    html: `<div class="rp" role="progressbar" aria-label="Loading"><i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i></div>`,
    css: `.rp { position: relative; width: 100px; height: 100px; }
.rp i { position: absolute; inset: 0; box-sizing: border-box; border: 4px solid var(--ink); border-radius: 50%; opacity: 0; animation: ring 1.8s cubic-bezier(.2, .6, .4, 1) calc(var(--i) * .6s - 1.8s) infinite; }
.rp::after { content: ""; position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; margin: -8px; border-radius: 50%; background: var(--acc); }
@keyframes ring { from { scale: .15; opacity: 1; } to { scale: 1; opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rp i { animation-duration: 7.2s; animation-delay: calc(var(--i) * 2.4s - 7.2s); } }`
  },
  {
    day: 18, name: "Dominoes", added: "2026-11-20",
    note: "Six tiles tip over in a chain, each a beat after the last, then stand back up. The red one starts it; the last one falls flat.",
    html: `<div class="dm" role="progressbar" aria-label="Loading">${[0,1,2,3,4,5].map(i => `<i style="--i:${i}"></i>`).join("")}</div>`,
    css: `.dm { display: flex; align-items: flex-end; gap: 12px; height: 56px; padding: 0 48px 0 4px; border-bottom: 3px solid var(--ink); }
.dm i { width: 8px; height: 44px; background: var(--ink); transform-origin: 100% 100%; animation: tip 2.4s calc(var(--i) * .09s) infinite alternate; }
.dm i:first-child { background: var(--acc); }
.dm i:last-child { --a: 90deg; }
@keyframes tip { 0%, 20% { rotate: 0deg; animation-timing-function: cubic-bezier(.55, 0, .9, .4); } 55%, 100% { rotate: var(--a, 38deg); } }
@media (prefers-reduced-motion: reduce) { .dm i { animation-duration: 9.6s; animation-delay: calc(var(--i) * .36s); } }`
  },
  {
    day: 19, name: "Hourglass", added: "2026-11-20",
    note: "The top drains while the bottom fills, then the glass turns over. Turned over, the full bottom is the full top, so the loop has no jump.",
    html: `<div class="hg" role="progressbar" aria-label="Loading"><i class="t"></i><i class="s"></i><i class="b"></i></div>`,
    css: `.hg { position: relative; width: 56px; height: 84px; border-block: 5px solid var(--ink); animation: turn 3.2s infinite; }
.hg::before { content: ""; position: absolute; inset: 0; background: var(--ink); opacity: .15; clip-path: polygon(0 0, 100% 0, 50% 50%, 100% 100%, 0 100%, 50% 50%); }
.hg i { position: absolute; left: 0; width: 100%; height: 50%; background: var(--acc); transform-origin: 50% 100%; }
.hg .t { top: 0; clip-path: polygon(0 0, 100% 0, 50% 100%); animation: drain 3.2s linear infinite; }
.hg .b { bottom: 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); animation: pile 3.2s linear infinite; }
.hg .s { top: 50%; left: 50%; width: 2px; margin-left: -1px; animation: stream 3.2s linear infinite; }
@keyframes turn { 0%, 75% { rotate: 0deg; animation-timing-function: cubic-bezier(.7, 0, .3, 1); } 100% { rotate: 180deg; } }
@keyframes drain { 0% { scale: 1; } 75%, 100% { scale: 0; } }
@keyframes pile { 0% { scale: 0; } 75%, 100% { scale: 1; } }
@keyframes stream { 0%, 72% { opacity: 1; } 74%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .hg, .hg .t, .hg .b, .hg .s { animation-duration: 12.8s; } }`
  },
  {
    day: 20, name: "Counter", added: "2026-11-20",
    note: "A percentage that counts 00 to 99 and wraps. Two digit strips step with steps(10); the tens strip runs ten times slower than the ones.",
    html: `<div class="ct" role="progressbar" aria-label="Loading">${[0,1].map(() => `<div class="c"><span>${[0,1,2,3,4,5,6,7,8,9].join("<br>")}</span></div>`).join("")}<b>%</b></div>`,
    css: `.ct { display: flex; align-items: flex-start; font: 400 64px/1 "Anton", Impact, sans-serif; font-variant-numeric: tabular-nums; color: var(--ink); }
.ct .c { height: 1em; overflow: hidden; }
.ct .c span { display: block; animation: roll 20s steps(10) infinite; }
.ct .c + .c span { animation-duration: 2s; }
.ct b { font-weight: 400; color: var(--acc); }
@keyframes roll { to { transform: translateY(-10em); } }
@media (prefers-reduced-motion: reduce) { .ct .c span { animation-duration: 80s; } .ct .c + .c span { animation-duration: 8s; } }`
  },
  {
    day: 21, name: "Radar", added: "2026-11-20",
    note: "A conic-gradient sweep turns over crosshairs. The blip lights up exactly when the sweep's leading edge passes it, then fades.",
    html: `<div class="rd" role="progressbar" aria-label="Loading"><i></i><b></b></div>`,
    css: `.rd { position: relative; width: 96px; height: 96px; box-sizing: border-box; border: 3px solid var(--ink); border-radius: 50%; overflow: hidden;
  background: linear-gradient(var(--ink), var(--ink)) 50% / 2px 100% no-repeat, linear-gradient(var(--ink), var(--ink)) 50% / 100% 2px no-repeat; }
.rd i { position: absolute; inset: 0; background: conic-gradient(transparent 0 250deg, var(--acc)); animation: sweep 2s linear infinite; }
.rd b { position: absolute; left: 61px; top: 22px; width: 10px; height: 10px; border-radius: 50%; background: var(--ink); animation: blip 2s linear infinite; }
@keyframes sweep { to { rotate: 1turn; } }
@keyframes blip { 0%, 11% { opacity: 0; scale: .5; } 13% { opacity: 1; scale: 1.2; } 30% { scale: 1; } 70%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rd i, .rd b { animation-duration: 8s; } }`
  },
  {
    day: 22, name: "Barcode", added: "2026-11-20",
    note: "A red laser line scans a barcode up and down. The bars are just flex items with different widths; alternate makes the scan go both ways.",
    html: `<div class="bc" role="progressbar" aria-label="Loading">${[3,1,2,1,4,1,1,3,2,1,3,1,2,2,1,4].map(w => `<i style="--w:${w}"></i>`).join("")}<b></b></div>`,
    css: `.bc { position: relative; display: flex; gap: 3px; height: 64px; padding: 0 8px; }
.bc i { width: calc(var(--w) * 2px); background: var(--ink); }
.bc b { position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--acc); animation: scan 1.6s cubic-bezier(.45, 0, .55, 1) infinite alternate; }
@keyframes scan { to { transform: translateY(61px); } }
@media (prefers-reduced-motion: reduce) { .bc b { animation-duration: 6.4s; } }`
  },
  {
    day: 23, name: "Roll", added: "2026-11-20",
    note: "A square tips over its front corner, again and again, through a clipped window. The rotation resets each roll while the position jumps one square ahead with steps(), so the seam never shows.",
    html: `<div class="rl" role="progressbar" aria-label="Loading"><div class="mv"><i></i></div></div>`,
    css: `.rl { position: relative; width: 96px; height: 40px; overflow: hidden; border-bottom: 4px solid var(--ink); }
.rl .mv { position: absolute; left: 0; bottom: 0; animation: travel 3s steps(5, end) -1.2s infinite; }
.rl i { display: block; width: 24px; height: 24px; background: var(--acc); transform-origin: 100% 100%; animation: tip .6s cubic-bezier(.6, 0, .4, 1) infinite; }
@keyframes travel { from { translate: -24px 0; } to { translate: 96px 0; } }
@keyframes tip { from { rotate: 0deg; } to { rotate: 90deg; } }
@media (prefers-reduced-motion: reduce) { .rl .mv { animation-duration: 12s; animation-delay: -4.8s; } .rl i { animation-duration: 2.4s; } }`
  },
  {
    day: 24, name: "Trace", added: "2026-11-20",
    note: "A heartbeat trace in inline SVG. pathLength=\"100\" makes the dash maths easy: a 30-unit dash with a 100-unit gap enters at the left and fully leaves at the right before the next one starts.",
    html: `<div class="tr" role="progressbar" aria-label="Loading"><svg viewBox="0 0 120 60" width="144" height="72" aria-hidden="true"><path class="bg" d="M2 32 H30 L36 22 L42 32 H50 L56 6 L64 54 L70 32 H80 L86 24 L92 32 H118"/><path class="fg" pathLength="100" d="M2 32 H30 L36 22 L42 32 H50 L56 6 L64 54 L70 32 H80 L86 24 L92 32 H118"/></svg></div>`,
    css: `.tr svg { display: block; overflow: visible; }
.tr path { fill: none; stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
.tr .bg { stroke: var(--ink); opacity: .18; }
.tr .fg { stroke: var(--acc); stroke-dasharray: 30 100; animation: trace 1.8s linear -.9s infinite; }
@keyframes trace { from { stroke-dashoffset: 30; } to { stroke-dashoffset: -100; } }
@media (prefers-reduced-motion: reduce) { .tr .fg { animation-duration: 7.2s; animation-delay: -3.6s; } }`
  },
  {
    day: 25, name: "Slide puzzle", added: "2026-11-20",
    note: "Three tiles and one hole. Every tile runs the same lap round the 2×2 board; offsetting each one by a different number of steps means only one moves at a time, always into the hole.",
    html: `<div class="pz" role="progressbar" aria-label="Loading"><i style="--o:10"></i><i style="--o:2"></i><i style="--o:6"></i></div>`,
    css: `.pz { position: relative; width: 64px; height: 64px; padding: 4px; border: 3px solid var(--ink); }
.pz i { position: absolute; left: 4px; top: 4px; width: 30px; height: 30px; background: var(--ink); animation: lap 4.8s calc(var(--o) * -.4s) infinite; }
.pz i:first-child { background: var(--acc); }
@keyframes lap {
  0% { translate: 0 0; animation-timing-function: cubic-bezier(.7, 0, .3, 1); }
  5%, 25% { translate: 34px 0; animation-timing-function: cubic-bezier(.7, 0, .3, 1); }
  30%, 50% { translate: 34px 34px; animation-timing-function: cubic-bezier(.7, 0, .3, 1); }
  55%, 75% { translate: 0 34px; animation-timing-function: cubic-bezier(.7, 0, .3, 1); }
  80%, 100% { translate: 0 0; }
}
@media (prefers-reduced-motion: reduce) { .pz i { animation-duration: 19.2s; animation-delay: calc(var(--o) * -1.6s); } }`
  },
  {
    day: 26, name: "Eclipse", added: "2026-11-20",
    note: "An ink moon crosses a red sun. The sun clips the moon with overflow: hidden, so you only see the bite; the ring stays lit at totality. It slows down through the middle.",
    html: `<div class="ec" role="progressbar" aria-label="Loading"><div class="sun"><i></i></div></div>`,
    css: `.ec { width: 72px; height: 72px; padding: 6px; border: 3px solid var(--acc); border-radius: 50%; }
.ec .sun { width: 100%; height: 100%; border-radius: 50%; background: var(--acc); overflow: hidden; }
.ec i { display: block; width: 100%; height: 100%; border-radius: 50%; background: var(--ink); animation: pass 3s infinite; }
@keyframes pass {
  0% { translate: -105% 0; animation-timing-function: cubic-bezier(.2, .6, .5, 1); }
  50% { translate: 0 0; animation-timing-function: cubic-bezier(.5, 0, .8, .4); }
  100% { translate: 105% 0; }
}
@media (prefers-reduced-motion: reduce) { .ec i { animation-duration: 12s; } }`
  },
  {
    day: 27, name: "Seesaw", added: "2026-11-20",
    note: "A plank rocks on a pivot and the ball rolls to whichever end is down. The ball is a child of the plank, so it only has to move along it.",
    html: `<div class="ss" role="progressbar" aria-label="Loading"><div class="p"><i></i></div><b></b></div>`,
    css: `.ss { position: relative; width: 130px; height: 72px; }
.ss .p { position: absolute; left: 0; right: 0; top: 34px; height: 6px; background: var(--ink); animation: tilt 1.8s cubic-bezier(.45, 0, .55, 1) infinite alternate; }
.ss i { position: absolute; left: 4px; bottom: 100%; width: 18px; height: 18px; border-radius: 50%; background: var(--acc); animation: along 1.8s cubic-bezier(.6, 0, .4, 1) infinite alternate; }
.ss b { position: absolute; left: 50%; top: 40px; margin-left: -16px; border: 0 solid transparent; border-width: 0 16px 28px; border-bottom-color: var(--ink); }
@keyframes tilt { from { rotate: -14deg; } to { rotate: 14deg; } }
@keyframes along { from { translate: 0 0; } to { translate: 104px 0; } }
@media (prefers-reduced-motion: reduce) { .ss .p, .ss i { animation-duration: 7.2s; } }`
  },
  {
    day: 28, name: "Ticker", added: "2026-11-20",
    note: "A news-ticker band. The text is repeated four times and the strip moves by exactly half its width, which lands on an identical frame.",
    html: `<div class="tk" role="progressbar" aria-label="Loading"><div aria-hidden="true">${"<span>Loading<b></b></span>".repeat(4)}</div></div>`,
    css: `.tk { width: 150px; overflow: hidden; padding: 8px 0; border-block: 3px solid var(--ink); }
.tk div { display: flex; width: max-content; animation: run 2.4s linear infinite; }
.tk span { display: flex; align-items: center; gap: 12px; padding-right: 12px; font: 400 28px/1 "Anton", Impact, sans-serif; color: var(--ink); text-transform: uppercase; white-space: nowrap; }
.tk b { width: 12px; height: 12px; background: var(--acc); }
@keyframes run { to { translate: -50% 0; } }
@media (prefers-reduced-motion: reduce) { .tk div { animation-duration: 9.6s; } }`
  },
  {
    day: 29, name: "Nested", added: "2026-11-20",
    note: "Three squares click round a quarter turn at a time, the middle one against the others. A square turned 90° looks the same, so each click is a fresh start.",
    html: `<div class="ns" role="progressbar" aria-label="Loading"><i></i><i></i><i></i></div>`,
    css: `.ns { display: grid; place-items: center; width: 84px; height: 84px; }
.ns i { grid-area: 1 / 1; box-sizing: border-box; border: 5px solid var(--ink); animation: q 1.6s cubic-bezier(.7, 0, .3, 1) infinite; }
.ns i:nth-child(1) { width: 84px; height: 84px; }
.ns i:nth-child(2) { width: 54px; height: 54px; animation-direction: reverse; animation-delay: .12s; }
.ns i:nth-child(3) { width: 24px; height: 24px; background: var(--acc); border-color: var(--acc); animation-delay: .24s; }
@keyframes q { 0% { rotate: 0deg; } 60%, 100% { rotate: 90deg; } }
@media (prefers-reduced-motion: reduce) { .ns i { animation-duration: 6.4s; } .ns i:nth-child(2) { animation-delay: .48s; } .ns i:nth-child(3) { animation-delay: .96s; } }`
  },
  {
    day: 30, name: "Calendar", added: "2026-11-20",
    note: "Thirty days, one cell each, the last one red. A mask cuts the layers into cells; done rows grow with steps(6) and the current row with steps(5), like the counter's digits but in two dimensions.",
    html: `<div class="cal" role="progressbar" aria-label="Loading"><i class="done"></i><div class="row"><i class="bar"></i><i class="mk"></i></div></div>`,
    css: `.cal { position: relative; width: 96px; height: 116px; overflow: hidden;
  mask: linear-gradient(90deg, black 16px, transparent 0) 0 0 / 20px 20px, linear-gradient(black 16px, transparent 0) 0 0 / 20px 20px; mask-composite: intersect; }
.cal::before { content: ""; position: absolute; inset: 0; background: var(--ink); opacity: .15; }
.cal i { position: absolute; left: 0; top: 0; background: var(--ink); }
.cal .done { width: 100%; height: 120px; transform-origin: 0 0; animation: rows 4.5s steps(6, end) infinite; }
.cal .row { position: absolute; left: 0; top: 0; width: 100px; height: 20px; animation: down 4.5s steps(6, end) infinite; }
.cal .bar { width: 100px; height: 20px; transform-origin: 0 0; animation: cells .75s steps(5, end) infinite; }
.cal .mk { width: 20px; height: 20px; background: var(--acc); animation: hop .75s steps(5, end) infinite; }
@keyframes rows { from { scale: 1 0; } to { scale: 1 1; } }
@keyframes down { to { translate: 0 120px; } }
@keyframes cells { from { scale: 0 1; } to { scale: 1 1; } }
@keyframes hop { to { translate: 100px 0; } }
@media (prefers-reduced-motion: reduce) { .cal .done, .cal .row { animation-duration: 18s; } .cal .bar, .cal .mk { animation-duration: 3s; } }`
  }
];
