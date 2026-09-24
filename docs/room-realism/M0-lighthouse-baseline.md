# M0 — Lighthouse Baseline + Production Walkthrough Evidence (v2 brief)

Date: 2026-09-24 · Branch: `codex/electronics-theme` @ `6bfd459` (post-square-fix)
Server: `next build` + `next start -p 3133` (production mode only, rule 9)
Harness: Brave headless via `lighthouse` and `puppeteer-core` (QA-only, installed
`npm i --no-save` — NOT project dependencies, never shipped).

## What was broken / fixed in this pass
- Nothing application-level was broken: build, lint, walkthrough were already green
  (see audit `docs/room-realism/AUDIT.md` and v1 `M0-baseline.md`).
- Missing under the v2 rules: any recorded Lighthouse baseline, any production-mode
  zero-console-error walkthrough evidence, and the QA tooling that produces them.
  Added: `scripts/qa-lighthouse.cjs` (Lighthouse via Brave via chrome-launcher) and
  `scripts/qa-walkthrough.cjs` (preloader→hallway→4 rooms→back, console/page-error
  capture, per-room FPS, crash-fallback check, tagged screenshots).
- Prior related fix already on this branch: `6bfd459` removes the flying-square
  `RoomDecor` confetti layer (200 deletions; visual regression from WS3).

## Build (production)
- `npm run build` → ✓ Compiled successfully, 10/10 static pages, zero errors
- `/` 48 kB / 136 kB First Load · `/email` 2.64 kB / 99.3 kB First Load

## M0 Lighthouse baseline (desktop, simulated throttling, Brave headless)
| Route | Perf | FCP | LCP | Speed Index | TBT | Report |
|---|---|---|---|---|---|---|
| `/` (full 3D experience) | **35** | 0.8 s | 6.7 s | 16.2 s | 12,400 ms | `qa-screenshots/M0-lh-home.json` |
| `/email` | **69** | 2.4 s | 3.2 s | 2.4 s | 0 ms | `qa-screenshots/M0-lh-email.json` |

These are the reference scores for every later milestone's "within 10 points" bar.

## Production walkthrough (`scripts/qa-walkthrough.cjs`, desktop profile)
preloader → entrance doors → corridor → gallery/studio/about/contact → back:
- Console errors: **0** · page errors: **0** · failed requests: **0** · crashes: **0**
- FPS: corridor 60 · gallery 60 · studio 59 · about 57 · contact 60 (p95 frame ≈ 17 ms)
- Screenshots: `qa-screenshots/M0-walkthrough-0-preloader.png`, `-1-entrance.png`,
  `-2-corridor.png`, `-3-gallery.png`, `-3-studio.png`, `-3-about.png`,
  `-3-contact.png` · machine report: `M0-walkthrough.json`

## Acceptance (v2)
- [x] `next build`: zero errors
- [x] `next start`: preloader → hallway → all 4 rooms load, zero console errors
- [x] M0 Lighthouse score recorded as baseline
- [x] Report states what was broken and how it was fixed

## Notes / limits
- Lighthouse runs simulated (Lantern) throttling — consistent before/after method
  for all milestone comparisons; VRAM/GPU per-run variance on this Microsoft-driver
  headless GPU is real, so the 10-point regression band is read generously.
- The brief's M0–M1 acceptance items from the v1 pass (`d424593`, `a38ccf5`) remain
  valid; this record supplies the v2-required quantitative baseline only.