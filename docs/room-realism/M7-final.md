# M7 — Final QA & integration

Goal: prove the M0–M6 chain is green on production builds in both modes, with
no collateral damage outside the four rooms.

## Commits verified (branch `codex/electronics-theme`, never `main`)
```
99b9294 M6 - optional electronics badge alt set (5 plates, flagged off)
0711c6c M5 - contact beam consumes palette.beam token
e3cbbc0 M4 - about sunset sky (IBL + warm key, low-tier baked fallback)
ea6d7bd M3 - studio night field degradation (low-tier clamp + reduced-motion freeze)
71e4f1d M2 - gallery sun-lit print lab (PBR floor/ropes, warm spots, sunset IBL)
fcb17b7 M1 - exponential preloader easing with visible 99pct hold
9ab1f8e M0 - stabilize baseline
```

## Build verification
| Check | Result |
|---|---|
| `npm run build` (default = stylized) | ✓ Compiled, 11/11 static pages, `/` 48 kB / 136 kB (M0 parity) |
| `NEXT_PUBLIC_REALISM_MODE=legacy` build | ✓ Compiled successfully, same page table |
| `next start` default → `GET /`, `/email`, `/robots.txt`, `/sitemap.xml` | all `200`, server log clean |
| `next start` legacy bundle → `GET /`, `/email` | all `200` |

## Invariant sweep
- **Hallway protected**: `git diff 9ab1f8e..HEAD -- corridor/ entrance/` → empty.
  Medallion/segment-door/entrance files untouched.
- **Theme config read-only**: `git diff 9ab1f8e..HEAD -- RoomThemeConfig.js` → empty.
- **Scope**: only the four room files + `scripts/check-m*.cjs` + restored
  `scripts/test-progress-ease.cjs` changed since the baseline.
- **No new deps**: `package-lock.json` diff since cleanup commit → empty;
  `package.json` diff since M0 → empty.
- **Flag**: all 6 room files use `NEXT_PUBLIC_REALISM_MODE !== 'legacy'`
  (unset ⇒ stylized default; `legacy` ⇒ rollback).
- **Timings**: preloader tear 1.8 s, `FAST_RATE 6.0 / SLOW_RATE 3.0`,
  SegmentDoors 0.9 s open / 0.7 s close, Entrance camera fly 1.8 s — all at
  baseline values.
- **Check scripts**: M3 13/13, M4 10/10, M5 10/10, M6 8/8 PASS;
  `scripts/test-progress-ease.cjs` → “all M1 acceptance checks pass ✓”
  (99 % hold 700 ms in the slow-compile scenario, max frame delta 0.848 pts).
- **Reduced motion**: `FloatingCodeParticles` freezes drift/rotation/parallax
  (`motionScale = 0`); `PerformanceProvider` still forces LOW tier on
  `prefers-reduced-motion`.

## Deviations (recorded, not hidden)
1. **Lighthouse + screenshots not captured**: the agent shell has no Chrome
   driver / WebGL walkthrough harness. Baseline remains
   `M0-lighthouse-baseline.md` (home 35, email 69); run the 10-pt-band
   comparison on a Vercel preview or a local Chrome session.
2. **FPS measurement** likewise not automatable here; degraded paths are
   verified structurally (particle clamp 60→24, single-ambient fallback, IBL
   off on low tier) rather than by profiler.
3. **Branch model**: M1–M6 landed directly on `codex/electronics-theme`
   instead of feature branches + `integration/room-realism`, because the
   teammate model hit its daily cap mid-run and the lead finished the
   milestones serially. `main` was never touched.

## Definition of Done status (PRD §10)
- [x] M0–M6 milestones green, both modes build, rollback verified.
- [x] Zero new console/page errors in production server smoke (no client-side
      console capture available headless — noted).
- [x] No new dependencies; no geometry replacement; hallway untouched.
- [ ] Lighthouse per-route band comparison — pending real browser (deviation 1).
