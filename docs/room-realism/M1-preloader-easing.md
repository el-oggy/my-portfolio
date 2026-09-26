# M1 — Preloader easing

Goal: exponential/ease-out smoothing on the 0→99% counter; hold visibly at 99%
until real assets/shaders are ready; keep the existing ~1.8s paper-tear exit.
Constraint honoured: paper texture, handwritten font, dashed rings and the tear
timeline are byte-identical — easing/hold behaviour only.

## What changed
- **New** `components/itom/src/utils/progressEase.js` — pure, framework-free math:
  - `easeProgress(current, target, deltaMs)` — exact exponential ease-out,
    `1 - e^(-rate·dt)` (not `min(1, rate·dt)`), so a long frame after a GC pause
    or tab switch can never overshoot or step the counter.
  - Two rates: **6.0/s while >8pts from the target** (never lags real loading),
    **3.0/s inside 8pts** (a completed texture batch reads as one glide instead
    of a step). Half-point snap (`SNAP_EPS = 0.5`) ends the exponential tail
    without ever moving the integer readout by more than one step.
  - `progressCeiling(sceneReady)` — **99 until ready, 100 after**.
- `components/itom/src/components/dom/Preloader.jsx`
  - tick now calls `easeProgress` + `progressCeiling`; readout is
    `min(100, max(0, min(ceiling, next)))` so the display can never show 100
    before the scene is ready (no premature jump-cut) while the eased value
    keeps advancing behind the pin.
  - Boot-watchdog release: when the 6s watchdog fires mid-climb, the monotonic
    target is lifted to 100 — previously the pin could strand the counter below
    the 99.5 exit threshold forever.

## Acceptance — verified
`node scripts/test-progress-ease.cjs` (new harness; replays a throttled feed —
8-in-flight batches + a 1.2s stall, 130 assets — through the **shipped** easing
functions loaded from source, plus the tick's target rules):

```
scenario: slow compile (1500ms shader hold)
  assets finished at   : 6624ms
  held at exactly 99%  : 700ms (min 700ms)
  exit gate reached at : 8267ms (ready + 133ms)
  max per-frame delta  : 0.848pts (budget 2.5)      pass ✓

scenario: fast compile (600ms shader hold)
  held at exactly 99%  : 0ms
  exit gate reached at : 7617ms (ready + 383ms)     pass ✓
```

- [x] Counter smoothed, not linear/jumpy under throttle — monotonic; worst
  per-frame delta 0.848pts against a 2.5pt budget across a stall + batch feed.
- [x] Visibly holds at 99% under throttle — long compile: exactly 99% for 700ms;
  readout never passes 99 before ready in either scenario.
- [x] Paper-tear exit unchanged — `startExit()` timeline untouched (1.8s
  power3.inOut, 0.1s pause, 0.5s fade); `git diff` shows no change in that block.
- [x] Production check — `npm run build` clean (identical bundle sizes, 48kB /
  136kB First Load); `next start` serves `/` 200; the shipped chunk contains the
  new math verbatim:
  `n=e+a*(1-Math.exp(-(Math.abs(a)>8?6:3)*o))`, `.5>Math.abs(t-n)&&(n=t)`,
  `Math.min(100,Math.max(0,Math.min(a?100:99,s)))`.
- [x] `npx eslint` on both touched files: clean exit 0.

## Notes / limits
- Browser-level throttling (Chrome DevTools "Slow 3G") could not be driven from
  this headless shell; the harness reproduces the same failure shape (bursty
  progress + a stall) deterministically and exercises the shipped functions.
- Runtime behaviour beyond the counter is unchanged: no new dependencies, no new
  assets, hallway and door-medallion components untouched.
