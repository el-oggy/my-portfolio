# M0–M7 Status Audit — `room-realism` (branch `codex/electronics-theme`)

Date: 2026-09-24 · Auditor: Cline (autonomous session) · Scope: status check only — no milestone implementation, no WIP commits.

## Verdict

| Milestone | Status | Commit | Doc / evidence |
|---|---|---|---|
| M0 — Stabilize baseline | ✅ DONE | `d424593` | `docs/room-realism/M0-baseline.md` |
| M1 — Preloader easing | ✅ DONE | `a38ccf5` | `docs/room-realism/M1-preloader-easing.md` |
| M2 — Gallery room | 🟡 PARTIAL — WIP uncommitted | none | none |
| M3 — Studio room | 🔴 NOT MET — defining item missing | none | none |
| M4 — About room | 🟡 PARTIAL — WIP uncommitted | none | none |
| M5 — Contact polish | 🟡 PARTIAL — WIP uncommitted; beam config dead | none | none |
| M6 — Electronics badges | 🔴 NOT STARTED | none | none |
| M7 — Final QA | 🔴 NOT RUN | none | none |

**Bottom line: 2 of 8 milestones fully done per the brief. M2–M5 exist only as one mixed,
uncommitted WIP changeset ("4a polish" session); M3's defining requirement (particle retint)
is missing; M6/M7 not begun. Nothing has been committed since M1.**

## Verified in this session (production mode, per rule #7)
- `npm run build` on the WIP tree → ✓ Compiled successfully, 10/10 static pages, zero errors;
  First Load JS 48 kB / 136 kB (identical to the M1-committed sizes — no bundle regression).
- `npx next start -p 3131` → `Ready in 772 ms`; `GET /` → HTTP 200; server log clean.
- Stack confirmed from package.json: @react-three/fiber 8.18.0 + drei 9.122.0 +
  @react-three/postprocessing 2.16.7 (dep added in WIP, lockfile updated) — the 3D wrapper IS
  react-three-fiber; no dependency added beyond the renderer's own effect ecosystem.
- Branch/remote confirmed: `codex/electronics-theme` @ `github.com/el-oggy/my-portfolio`.

## Per-milestone detail

### M0 — ✅ DONE (committed `d424593`, doc present)
- `next build` zero errors ✓ (re-verified today, also with the WIP applied)
- Server boots clean ✓ (HTTP-level; the full browser walkthrough was documented in M0 as not
  exercisable headless — virtual room routes are History-API client routes, not Next routes)
- Prior Antigravity-session errors: none reproduced ✓
- Hallway + medallion files untouched in M0 ✓

### M2 — 🟡 PARTIAL (gallery / projects)
Exists:
- Real project photos on paper-card geometry ✓ at HEAD: `GalleryRoom` FALLBACK_PROJECTS →
  `/textures/gallery/ad_*.webp` (+ `_painted` variants) — Adarsh's own project photos via
  `scripts/import-art.mjs`; card layout unchanged.
- WIP (uncommitted): shared radial-gradient sun disc + halo (`RoomBackdrop.makeSunTexture`),
  gallery `sun {#fff6e8, 0.5}` + `bloom {0.35 / 0.8}`; base gradient stays `#ff8fb0 → #fff0d9`
  ✓ as a LIGHT SOURCE (bloom feeds the hot core), not a flat overlay wash; enterPreview colour
  flood at door click (`SceneContext.previewRoom` → `DoorSection`); `PostFX` (Bloom + Vignette,
  tier-gated: LOW skips composer, 8x/4x MSAA) mounted in `Experience`.
Missing to accept:
- [ ] `feat(room-realism): M2 -` commit (rule #3)
- [ ] M2 milestone doc + labelled before/after screenshot pair (`evidence/` holds gallery shots
      from the flood session, but nothing referenced as M2 acceptance)
- [ ] Lighthouse perf within 10 points of M0 baseline — M0 never recorded a Lighthouse score,
      and this headless shell cannot drive Lighthouse (no Chrome driver) → process gap; needs a
      real-browser or Vercel-preview PageSpeed run
- [ ] Full walkthrough with zero console errors (headless-shell limitation, same as M0)

### M3 — 🔴 NOT MET (studio / firmware)
- **Defining item missing: `FloatingCodeParticles.jsx` line 203 still `color="#1a1a1a"` — the
  retint to the existing accent trio `#8b5cff / #ff5d8f / #4dd8ff` was NEVER done.** The trio
  exists in `RoomThemeConfig` studio `accents`, but the particles do not use it.
- Constraints intact: monitor tower layout ✓, `FloatingCodeParticles.jsx` present ✓, dark violet
  fog ✓ (`#140a2b` fog / `#0d0620` bg / `#4a2a7d` gradient bottom).
- WIP adds studio `sun` (violet city-glow `#7d5cff`, 0.4) + `bloom {0.6 / 0.25}` — monitor glow
  via bloom plausible, but uncommitted and unverified.
- "Code reflections": nothing found in code → not implemented.
- No commit, no doc, no exact-hex colour verification, no screenshots.

### M4 — 🟡 PARTIAL (about / journey)
- `PaperAirplane` + `InfiniteSkyManager` + milestone islands present (committed earlier;
  brush-wipe entry committed `2e179fd`) ✓.
- Base gradient stays `#7ebcff → #ffd5a3` ✓; WIP lighting-only treatment: about
  `sun {#ffd9a0, 0.65}` + `bloom {0.4 / 0.72}`; no geometry replacement ✓.
- Optional god-rays: not implemented (optional per spec — acceptable, record the skip).
- No M4 commit/doc/screenshots. Note: WIP comments tagged "4a" also bundle non-M4 items
  (SignSystem settle-in, preloader readout fade, entrance intro dolly) — one mixed polish session.

### M5 — 🟡 PARTIAL (contact)
- **`beam: '#ffd27a'` is a DEAD config value — no component consumes `theme.palette.beam`; no
  beam geometry exists anywhere** (searched all sources). The lighthouse is a textured plane
  (`latarniaTexture`, tint `#e0e0e0`) that reads via bloom only; "realistic beam" is therefore
  unverified.
- Dusk-blue base `#182740` ✓ in theme `background`; `ContactRoom` dock/wave/ship/barrel/message
  interactions intact ✓.
- Fireflies: not added (permitted — "only if the perf budget from M2-M4 allows"; budget
  unverified, so skipping is defensible but must be recorded).
- No commit/doc.

### M6 — 🔴 NOT STARTED (optional)
- No chip/MCU/sensor/drone-propeller/RTL-gate badge components anywhere (searched
  `ElectronicsBadge|ChipBadge|BadgeSet` + badge/medallion terms). Only language `LogoBadges` on
  the entrance doors. Live door components untouched ✓ (trivially).

### M7 — 🔴 NOT RUN
- Code-level reduced-motion handling exists: `PerformanceContext` forces LOW tier on
  `prefers-reduced-motion`; `SignSystem`, `EntranceDoors` (WIP), `RoomDecor` guard animations.
  No runtime verification, no mobile viewport pass, no full walkthrough log.

## WIP inventory (uncommitted — do not lose)

| File | Change | Belongs to |
|---|---|---|
| `components/itom/src/components/canvas/PostFX.jsx` | NEW — Bloom+Vignette composer, per-room colour-gated, tier-gated | M2 (shared infra, reused by M3–M5) |
| `.../canvas/rooms/RoomBackdrop.jsx` | shared sun disc + halo sprite per room | M2 / M4 |
| `.../canvas/rooms/RoomThemeConfig.js` | `bloom` + `sun` entries for all four rooms; hallway bloom hard-off | M2–M5 |
| `.../context/SceneContext.jsx` | `enterPreview`/`previewRoom` colour flood at door click; dev-only `window.__itom` | M2 (flood) + cleanup debt |
| `.../canvas/corridor/DoorSection.jsx` | calls `previewRoom(doorId)` at click | M2 |
| `components/ItomExperienceCore.jsx` | atmosphere flood reads `enterPreview` | M2 |
| `.../canvas/Experience.jsx` | mounts `PostFX`; passes `introReady` | M2 + 4a |
| `.../canvas/entrance/EntranceDoors.jsx` | intro dolly + staggered click choreography + hover micro-timing | 4a polish |
| `.../canvas/entrance/SignSystem.jsx` | sign settle-in on intro (elastic decay) | 4a polish |
| `.../components/dom/Preloader.jsx` | tabular-nums readout, pause 0.1→0.22, readout fades before tear | 4a polish |
| `package.json` / `package-lock.json` | + `@react-three/postprocessing` | M2 |
| `docs/room-realism/evidence/` (untracked) | 27 screenshots + probe HTMLs from the flood session | M2–M5 evidence |
| `cdp-check.txt`, `cdp-out.txt`, `cdp-state.txt`, `.agent/` (untracked) | debug output / agent skills | cleanup decision |

## Rules-boundary notes (need the owner's call)
1. **EntranceDoors.jsx (WIP)** — the hero door file carries the language medallions. The WIP
   changes only animation choreography (durations/eases/intro dolly); `LogoBadges` and the
   medallion visuals are untouched. Strictly, rule #4 protects "language-medallion door
   components"; this touches the file but not the medallions. Confirm OK, or revert the
   choreography hunks.
2. **Preloader.jsx (WIP)** — changes the tear-timeline beat (pause 0.1→0.22; readout fades
   before the tear). M1's acceptance pinned the tear as unchanged at M1 time; this is later
   polish. Confirm, or revert to the M1-pinned timeline.
3. **SceneContext dev-only `window.__itom`** — `NODE_ENV`-gated (stripped in production builds)
   but commented "REVERT after handoff" — cleanup debt.
4. Untracked junk (`cdp-*.txt`) and `.agent/` — delete/ignore or commit deliberately.

## Hard blockers
- **Lighthouse** cannot be measured from this headless shell (no Chrome/Lighthouse driver; M0
  hit the same wall). The M2–M5 perf bar needs a real-browser or Vercel-preview PageSpeed run.
- **Full WebGL walkthrough** (preloader → hallway → rooms → back) is not exercisable via HTTP —
  needs a real browser pass (M7 especially).

## Recommended order of operations (to reach "everything done")
1. Decide the WIP's fate: split into per-milestone commits (M2 infra first: PostFX + sun disc +
   flood + gallery/hallway theme entries + dep), or commit as one labelled combined commit —
   rule #3's letter is per-milestone, so splitting is the safe read.
2. M3: retint `FloatingCodeParticles` to the trio (3 hex values, exact), verify in production,
   commit with screenshots.
3. Fold the "4a polish" hunks (preloader readout, sign settle, entrance dolly) after the
   rule-#4 boundary call, commit.
4. M2–M5 evidence: real-browser Lighthouse + before/after screenshots + per-milestone docs
   (`M2-gallery.md` … `M5-contact.md`), commit each.
5. M6: badge set as a NEW, feature-flagged, isolated component set; render in isolation; commit.
6. M7: full QA pass (build, walkthrough, reduced-motion runtime, mobile) + final report.