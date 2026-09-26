# PRD — room-realism Phase 2: Closing M2–M7

> ⚠️ **SUPERSEDED — 2026-09-26.** This document is **stale and must not be used for planning.**
> It was written when M2–M7 were genuinely unstarted, per `AUDIT.md`. That is no longer true:
> M2 `71e4f1d`, M3 `ea6d7bd`, M4 `e3cbbc0`, M5 `0711c6c` and M6 `99b9294` have since been
> committed, and M7/M8/M9 work has been done. Every "never implemented / never started" claim
> below is out of date, and the `PostFX.jsx` / `RoomBackdrop` / `@react-three/postprocessing`
> WIP it describes never landed (no postprocessing dependency exists in `package.json` today).
>
> **Use [`docs/PRD-phase2.md`](./PRD-phase2.md) instead.** Retained only as historical record.


**Branch:** `codex/electronics-theme` (all work happens here; never merge to `main`)
**Companions:** `docs/PRD.md` (Phase 1 — complete), `docs/room-realism/AUDIT.md` (status audit
this PRD assumes — read it first), `docs/room-realism/M0-baseline.md`, `M1-preloader-easing.md`.

## 1. Problem statement

Phase 1 (M0–M1) landed: a reproducible production build and an eased preloader with a visible
99% hold. Since then one mixed, uncommitted "4a polish" session left the tree carrying
room-atmosphere infrastructure (per-room sun discs, bloom/vignette PostFX, door-click colour
flood, entrance/sign/preloader choreography) that has never been validated per the milestone
process. M3's defining requirement (code-particle retint to the accent trio) was never
implemented, M5's lighthouse beam exists only as a dead config value, M6 (electronics badge
set) was never started, and M7 (final QA) never ran. Deployed site:
`adarsh-vlsi.vercel.app`.

## 2. Goals / success criteria (define "done")

| # | Goal | Target | How measured |
|---|---|---|---|
| G1 | WIP committed per-milestone | every changed file lands under a `feat(room-realism): M<n> -` commit | `git log` |
| G2 | M3 particle colours exact | `#8b5cff / #ff5d8f / #4dd8ff` verbatim in `FloatingCodeParticles` | code grep + screenshot |
| G3 | Per-room realism visible | sun/bloom reads as a light source per room; hallway stays monochrome | before/after screenshots |
| G4 | Perf budget | Lighthouse perf within 10 pts of M0 baseline per room route | PageSpeed (Vercel preview or local Chrome) |
| G5 | Zero console errors | 0 errors across preloader → hallway → 4 rooms → back | browser harness |
| G6 | M6 badges isolated | badge set renders in isolation behind a feature flag; live doors untouched | isolated render + grep |
| G7 | Reduced-motion | particles/parallax pause or reduce when `prefers-reduced-motion: reduce` | runtime emulation check |
| G8 | Mobile sanity | no crash, no unacceptable FPS drop at 390×844 | emulated viewport pass |

## 3. Workstreams (run in order)

### WS-A — Validate & commit the in-flight WIP (M2 core)
- Split the WIP into per-milestone commits. M2 lands first: `PostFX.jsx` (new), sun disc in
  `RoomBackdrop`, `RoomThemeConfig` gallery/hallway entries, `enterPreview`/`previewRoom` flood
  (`SceneContext`, `DoorSection`, `ItomExperienceCore`), `Experience.jsx` PostFX mount,
  `package.json` + lockfile. The remaining theme entries (studio/about/contact) land with
  M3/M4/M5 respectively.
- `npm run build && next start` per commit; zero errors (production mode, rule #7).
- Evidence: `docs/room-realism/M2-gallery.md` + before/after screenshots into `evidence/`.

### WS-B — M3 completion (studio)
- Retint `FloatingCodeParticles.jsx`: replace `color="#1a1a1a"` with the trio
  `#8b5cff / #ff5d8f / #4dd8ff` (bucketed per particle; no new hex values).
- Verify the WIP studio bloom (0.6 / 0.25) + violet city-glow reads as monitor glow / neon spill
  at night; keep dark violet fog and monitor tower layout untouched.
- "Code reflections" — cheap additive fake only if G4 allows; otherwise record the skip.
- Evidence: exact-hex grep + screenshot; commit `feat(room-realism): M3 - ...`.

### WS-C — M4 completion (about)
- Land the about `sun`/`bloom` entries (lighting-only); confirm airplane + islands still animate
  correctly (entry, looping flight, milestone reveal).
- Optional god-rays only if the G4 budget allows (skip = record why).
- Evidence + commit.

### WS-D — M5 polish (contact)
- Decide the beam: EITHER consume `theme.palette.beam` with a cheap additive beam mesh
  (translucent cone/plane) on the lighthouse, OR delete the dead config value. No new deps.
- Fireflies/particles only if G4 allows. Confirm dock/wave/lighthouse/barrel interactions.
- Evidence + commit.

### WS-E — M6 electronics badge set (optional, only if A–D green)
- NEW, feature-flagged (`NEXT_PUBLIC_ENABLE_ELECTRONICS_BADGES`), isolated component set:
  chip / MCU / sensor / drone-propeller / RTL-gate badges. Additive only; live door components
  untouched; must render in isolation (standalone story/route) before any wiring.

### WS-F — M7 final QA
- `next build` clean; manual walkthrough preloader → hallway → each room → back, zero console
  errors; `prefers-reduced-motion` runtime check (particles/parallax pause or reduce); mobile
  viewport pass (390×844, no crash, no unacceptable FPS drop); final report doc.

## 4. Constraints (unchanged from the brief)
- M0→M7 in order; per-milestone acceptance loop before committing; commit format
  `feat(room-realism): M<n> - <short desc>`.
- Never touch the hallway `#fafafa` pencil aesthetic or auto-opening segment doors; medallion
  door components only additively in M6 (and only with explicit sign-off on the in-flight WIP
  choreography hunks in `EntranceDoors.jsx` / `Preloader.jsx` — see AUDIT rules-boundary notes).
- No new npm dependencies; new assets = Adarsh's own photos or Unsplash/Pexels, WebP-compressed.
- Test in production mode (`next build && next start`), not dev.
- Blocked ⇒ STOP and report the exact blocker; no guessing or silent skips.

## 5. Risks
- Bloom/vignette PostFX costs fill-rate on LOW tier — the composer is already skipped there;
  re-verify G4/G8 after each room milestone.
- Entrance choreography changes user-perceived timing — screenshot + manual pass before commit.
- Lighthouse on a WebGL-heavy route is noisy — use the 10-point band vs the M0 baseline, not
  absolutes; record the M0 Lighthouse score in `M2-gallery.md` if not already captured.
- Splitting the WIP could temporarily ship theme entries whose room hasn't landed — safe because
  `PostFX`/backdrop read themes at runtime (unknown rooms fall back to hallway), but verify each
  intermediate commit anyway.

## 6. Out of scope
Merging to `main`, deployment config, hallway redesign, new rooms, CMS integration, replacing
language medallions, geometry replacement in any room.