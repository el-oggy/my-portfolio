# Home WebGL performance pass

Status: **PARTIAL — the Phase 2 perf floor is still not met.** Recorded honestly rather
than re-run until it went green.

## Floor vs. measured

Floor: performance `>= 45`, LCP `<= 4000 ms`. Measured on `npm run start` (production
build), Lighthouse mobile simulation, 4 consecutive runs on an otherwise idle machine.

| | before | after | floor |
|---|---|---|---|
| performance | 37 | **43–44** | 45 |
| LCP (simulated) | 6748 ms | **~6800 ms** | 4000 ms |
| TBT | 7766 ms | **3588–4095 ms** | — |
| FCP | 759 ms | 763 ms | — |
| CLS | ~0 | 0 | — |
| images transferred | 3335 KB | **1318 KB** | — |
| XHR transferred | 289 KB | **0 KB** | — |
| corridor FPS (walkthrough) | 13.9 | **60** | — |

TBT is cut roughly in half and the weight is down sharply, but performance lands at
43–44 against a floor of 45, and LCP is still ~1.7× over budget. **This does not pass.**

## What was actually slow

`npm run qa:perf-diagnose -- qa-evidence/lighthouse-home.json` on the original report:

- 13 long tasks, 8374 ms blocking.
- **7511 ms of 7766 ms TBT (97%) was one chunk** — `735.8522e2e38336cea7.js`, the
  three.js/ITOM bundle (212 KB, contains `WebGLRenderer`).
- A single 4611 ms long task dominated it.

So the problem was never "the page is heavy". It was one synchronous scene build.

## Changes made

1. **Corridor deferred until the doors are clicked** (`Experience.jsx`,
   `InfiniteCorridorManager.jsx`, `SceneContext.jsx`, `EntranceDoors.jsx`).
   Segments 0 and 1 were pre-mounted at `[0, 1]` to "warm shaders during the
   preloader". They occupy Z=10..-150 while the camera starts at Z=28 behind entrance
   doors at Z=22 — they are invisible for the entire boot. Building them cost the
   4.6 s task. A new `hasStartedEntrance` flag fires `startEntrance()` inside
   `EntranceDoors.handleClick`, so the build overlaps the ~2.5 s door-open timeline.

   *Gating on the existing `hasEntered` instead was tried first and was wrong*: that
   fires at the END of the animation, so the walkthrough captured a blank corridor.

2. **Removed drei `<Preload all />`** (`ItomExperienceCore.jsx`). It force-loaded every
   texture in the scene graph before first paint (~130 requests) and, by walking the
   whole graph, also pulled the corridor back in — undoing change 1. Texture loading
   is already driven by the `LoadingManager` that `Preloader.jsx` reads for its progress.

3. **Preloaded the two above-the-fold fonts** (`app/layout.tsx`). The preloader is the
   LCP candidate and renders in CabinSketch; both faces were discovered only after CSS
   parse. Deliberately not preloaded: RubikScribble (583 KB) and FrederickatheGreat
   (484 KB), which mount after the preloader.

## Why LCP will not come down without a deeper change

The LCP element is `div.preloader > div.preloader__half` — a **DOM element inside the
real `Preloader`**, which lives in the three.js chunk. Observed (unthrottled) LCP is
**742 ms**. The ~6800 ms figure is entirely Lighthouse's Lantern *simulation* of a
470 KB script payload on slow 4G plus main-thread contention.

Deferring the three.js import behind a two-frame paint gate was **tried and reverted**:
it made things worse (perf 44 → 40, LCP 6754 → 6867 ms). The reason is the LCP element
lives *inside* that chunk, so delaying the import delays the LCP element itself.

The real fix is to get the preloader out of the three.js bundle so it can paint from
the initial HTML. `Preloader.jsx` currently imports `* as THREE` (for
`THREE.DefaultLoadingManager`) and `gsap`, which is what ties it to the heavy chunk.
Untried because it touches the loading-progress contract directly.

## Measurement caveat

Headless figures use software/emulated GPU rendering. Variance between runs on a
loaded machine is large (I measured 38–44 for the identical build). All numbers above
are from an idle machine, 4 consecutive runs.
