# PRD — Phase 2: Make Room-Realism Actually Verifiable & Ship It

| | |
|---|---|
| Project | my-portfolio (github.com/el-oggy/my-portfolio) |
| Branch | `codex/electronics-theme` |
| Deploy target | adarsh-vlsi.vercel.app |
| Stack (verified from package.json) | Next.js 14.2.35 / React 18 / **@react-three/fiber 8.18.0** / @react-three/drei 9.122.0 / three 0.169.0 / GSAP 3.15.0 / framer-motion 11 / lenis 1.3.26 / sass / tailwind |
| Owner | Adarsh |
| Date | 2026-09-26 |
| Status of this doc | **Supersedes `docs/PRD-future.md`** (that doc is stale — it still describes M2–M7 as unstarted) |
| Companions | `docs/PRD.md`, `docs/DESIGN-PRD.md`, `docs/room-realism/*.md` |

---

## 0. Read this first

Phase 1 (M0–M7) is **far more complete than the last audit said, and far less shippable than the
M7 report implies.** The code is genuinely good. The *evidence* is missing, and **none of it is on
GitHub.**

Every claim in this doc was re-run locally on 2026-09-26, not copied from the milestone reports.

---

## 1. Verified status of M0–M9 at HEAD `1e96607`

Re-ran: `npm run build`, `NEXT_PUBLIC_REALISM_MODE=legacy npm run build`, all five check harnesses,
and the do-not-touch diff sweeps.

| MS | Commit | Code landed | Auto-check (re-run today) | Doc | Before/after screenshot | Lighthouse vs baseline | Real verdict |
|---|---|---|---|---|---|---|---|
| **M0** | `9ab1f8e` | ✅ | ✅ build clean | ✅ | ❌ | ⚠️ numbers in doc, not reproducible | **CODE GREEN, EVIDENCE BROKEN** |
| **M1** | `fcb17b7` | ✅ | ✅ harness passes | ✅ | n/a | n/a | **DONE** |
| **M2** | `71e4f1d` | ✅ | ❌ **no check script at all** | ❌ **no doc** | ❌ | ❌ | **CODE LANDED, ACCEPTANCE UNMET** |
| **M3** | `ea6d7bd` | ✅ | ✅ 13/13 PASS | ✅ | ❌ | ❌ | MOSTLY DONE |
| **M4** | `e3cbbc0` | ✅ | ✅ 10/10 PASS | ✅ | ❌ | ❌ | MOSTLY DONE (god-rays skipped, justified) |
| **M5** | `0711c6c` | ✅ | ✅ 10/10 PASS | ✅ | ❌ | ❌ | MOSTLY DONE (fireflies skipped, justified) |
| **M6** | `99b9294` | ✅ | ✅ 8/8 PASS | ✅ | ❌ (n/a) | n/a | **DONE** |
| **M7** | — (QA pass) | n/a | — | ✅ self-reports gaps | ❌ | ❌ | **NOT GREEN — self-admits it** |
| M8 | `36eb2d5` | ✅ mobile portrait FOV | — | ✅ | ❌ | n/a | done beyond brief |
| M9 | `1e96607` | ✅ lint/type/asset sweep | ✅ | ✅ | n/a | n/a | done beyond brief |

### Confirmed green by direct execution today

- `npm run build` → `✓ Compiled successfully`, **11/11 static pages**, `/` **48 kB / 136 kB**
  (`/email` 1.81 kB / 98.5 kB) — **exact M0 baseline parity**, zero errors, warnings only.
- `NEXT_PUBLIC_REALISM_MODE=legacy npm run build` → **compiles clean, identical route table**.
  The §11 rollback path genuinely works. Independently re-verified, not taken on faith.
- `node scripts/test-progress-ease.cjs` → all M1 checks pass; 99% hold = 700 ms,
  max per-frame delta 0.848 pts against a 2.5 pt budget.
- M3 13/13, M4 10/10, M5 10/10, M6 8/8 — **all exit 0**.
- Rule #4 honoured: `git diff 9ab1f8e..HEAD -- corridor/ entrance/` → **empty**. Hallway,
  segment doors, and language-medallion components were never touched.
- Rule #5 honoured: `git diff 9ab1f8e..HEAD -- package.json` → **no dependency added**, only two
  npm scripts. `@react-three/postprocessing` is **not** installed.
- Scope clean: only the 4 room files + `ItomExperienceCore.jsx` + `MessagePaper.jsx`
  + scripts + lint fixes changed since M0.

---

## 2. Gap register — the actual Phase 2 work

Ordered by blast radius. **G1 is a one-command fix and is the only thing standing between
"done" and "actually done."**

### G1 — 🔴 NOTHING IS PUSHED. The whole programme is local-only. *(blocker, P0)*

```
local  HEAD                       = 1e96607
origin/codex/electronics-theme    = b9da5a2          ← strictly BEHIND, 11 commits
git log HEAD..origin/…            → empty (no remote-only commits)
git merge-base --is-ancestor origin/… HEAD → exit 0  (remote IS an ancestor of HEAD)
```

**All 11 commits** — `29d21a9`, `a6d4a83`, M0 `9ab1f8e` … M6 `99b9294`, M8 `36eb2d5`, M9 `1e96607` —
exist **only on this laptop**. `main` is additionally 30+ commits behind at `86e287b`.

> ⚠️ **Correction (2026-09-26, re-tested).** An earlier read of this gap claimed the branch had
> *diverged* from the remote and that shipping required a force-push. **That was wrong** — it came
> from testing `--is-ancestor` in only one direction. The remote is a strict **ancestor** of HEAD:
> history is linear, and the "old" milestone commits (`74f04a4`, `a38ccf5`, `b036b28` …) are
> ancestors of the current chain, not a competing lineage. **Shipping is a plain fast-forward
> `git push`. No force, no risk, nothing to archive.** Decision D1 is downgraded accordingly.

Consequence: **adarsh-vlsi.vercel.app cannot be showing any of this work.** Whatever is live was
built from a commit that does not contain M0–M9. There is **no `vercel.json`** in the repo and **no
`.vercel` link dir or `VERCEL_TOKEN`** present, so which branch Vercel builds lives only in the
Vercel dashboard, and deployment state cannot be read from this machine.

*Single-machine risk: one disk failure and the entire room-realism programme is gone.*

**Fix:** plain `git push origin codex/electronics-theme`; confirm the Vercel production target
branch; confirm the live deployment's commit SHA equals the pushed SHA.

### G2 — 🔴 Zero screenshots exist in the repository *(P0, acceptance-blocking)*

`Get-ChildItem -Recurse -Include *.png -Path docs` → **empty**. No `qa-screenshots/`, no `evidence/`,
and no `qa-screenshots/` entry in `.gitignore` — the directory simply does not exist.

Yet M2, M3 and M4 acceptance each explicitly require *"screenshot before/after"*. A prior session
tried to satisfy this: `b9da5a2 chore: Add QA screenshots for M3-M5` — but inspecting the blobs
shows every one is a **1×1-pixel blank PNG (68 bytes)**, and the commit message itself admits
*"Added placeholder screenshots due to headless WebGL constraints."*

```
$ git show b9da5a2:qa-screenshots/M3-after.png | head -c 24 | xxd
...IHDR 00 00 00 01 00 00 00 01...   ← 1 × 1 pixel
```

**Six fake screenshots were committed as acceptance evidence for three milestones.** They were later
deleted in `29d21a9` (already in HEAD's history, which is why no `qa-screenshots/` dir exists today),
so the working tree is clean — but the fabricated blobs remain permanently in git history. No real
screenshot of any room has ever existed in this repository, on any branch. Beyond failing the
acceptance bar, this is the pattern the brief's rule #6 exists to prevent — fabricated placeholders
standing in for real verification. Phase 2 must treat any "evidence" claim as unverified until a
real PNG with plausible dimensions is in hand.

This is why the visual goal is still unproven: for M2/M3/M4 nobody has ever looked at a picture of
the result and compared it to the spec.

### G3 — 🔴 The QA harness was deleted; the perf bar is unreproducible *(P0)*

`M0-lighthouse-baseline.md` states it *"Added: `scripts/qa-lighthouse.cjs` … `scripts/qa-walkthrough.cjs`"*.
**Neither file exists.** `scripts/` today contains exactly:

```
check-assets.cjs  check-m3-studio.cjs  check-m4-about.cjs  check-m5-contact.cjs
check-m6-badges.cjs  test-progress-ease.cjs
```

So the load-bearing M2–M7 acceptance item — *"Lighthouse perf on this route within 10 points of the
M0 baseline"* — **has no tool that can evaluate it**, and the recorded baseline (`home 35`,
`email 69`) can never be re-measured for comparison. The "0 console errors / 0 crashes /
corridor 60fps, gallery 60, studio 59, about 57, contact 60" numbers are unreproducible prose.

**Also note the baseline itself is alarming:** Lighthouse **35** on `/` with **LCP 6.7 s** and
**TBT 12,400 ms**. A "within 10 points" band around 35 means anything from 25–45. This budget is
too loose to detect real regressions and too low to be a goal. See WS-4.

### G4 — 🟠 M2 (Gallery) is the only room with no verification whatsoever *(P1)*

M3/M4/M5/M6 each ship a `check-m*.cjs` harness. **M2 ships none** — and no `M2-gallery.md`.
The commit is real, substantive work (2 files, +23/−3):

- `ropeMat` / `thresholdMat`: `MeshBasicMaterial` → `MeshStandardMaterial` (roughness 0.9/0.85) under `isStylized`
- added a second warm `spotLight` `#ff8fb0` at `[-6, 8, 4]`
- kept `Environment preset="sunset"` IBL + `ContactShadows` + warm ambient

Two things nobody has confirmed: **(a)** that it visibly reads as "sunlit print lab", and **(b)**
that the 10-point perf band survived `Environment` + `ContactShadows` + a new shadow-casting spot.
Gallery is also the room that gained the most GPU work of any milestone.

### G5 — 🟠 Every milestone report is gitignored *(P1)*

`.gitignore` contains **`/docs/`** (widened in `a6d4a83`, which also untracked the docs). So all
eleven `docs/room-realism/*.md` reports are **untracked local files**: invisible on GitHub, absent
from CI, absent from the Vercel build, and absent to any other agent or to Adarsh on another
machine. PRD §7.5's "Milestone Report filed for every commit" is technically satisfied and
effectively void — nothing was filed anywhere anyone else can read.

### G6 — 🟠 Reduced-motion is structurally sound but runtime-unproven *(P1)*

Verified in code: `PerformanceContext.jsx:62` detects `prefers-reduced-motion: reduce` and forces
`TIERS.LOW`; `utils/tier.js` flags low-tier via mobile UA **or** `cores <= 4`;
`FloatingCodeParticles` clamps `lowTier ? 24 : PARTICLE_COUNT` and sets `motionScale = 0`.

**But `prefers-reduced-motion` appears in exactly one file.** Studio's particles freeze; whether
**camera drift and parallax pause in Gallery / About / Contact** under reduced-motion was never
proven at runtime — and PRD §6 requires it *"across all four rooms."*

### G7 — 🟡 Three design features were declined, not delivered *(P2 — needs owner decision)*

Skipped for legitimate, documented reasons (each is honest, not sloppy):

| Feature | Why skipped | Legit? |
|---|---|---|
| Studio bloom / neon spill | `@react-three/postprocessing` absent; PRD §8.1 forbids unjustified deps | ✅ correct call |
| About god-rays | Same; fullscreen composer pass with no measured headroom | ✅ correct call |
| Contact fireflies | "Only if headroom allows", and headroom was never measured | ⚠️ blocked by G3, not by design |
| Studio code reflections | "No perf headroom proof on throttled mobile" | ⚠️ same |

DESIGN-PRD §3 asked for *"light bloom on emissive monitor surfaces **only if a postprocessing
library is already a dependency**"* — it isn't, so the skip is **spec-compliant**. But the
"monitor glow, neon spill" brief is then only half-delivered (point lights, no bloom).
**This is a product decision for Adarsh, not an agent's call.**

---

## 3. Workstreams

Run **WS-0 → WS-1 → WS-2 → WS-3 → WS-4** in order. WS-5 is optional and gated on all four.

### WS-0 — Ship what already exists *(the G1 fix — do this first, ~15 min)*

1. `git push origin codex/electronics-theme` — **plain fast-forward, no force needed** (remote is a
   strict ancestor of HEAD; see the G1 correction). Confirm it lands as non-forced.
2. Confirm in the Vercel dashboard which branch is production; make it `codex/electronics-theme`,
   **or open a PR to `main`** (main is 30+ commits stale — that gap is its own decision, D2).
   ⚠️ Not drivable from this machine: no `.vercel/` link dir, no `VERCEL_TOKEN`, no `vercel.json`.
3. Redeploy (or confirm auto-deploy fired). Compare the deployed commit SHA to `1e96607`.

**Acceptance:** GitHub shows `1e96607`-or-later on the production branch; the `adarsh-vlsi.vercel.app`
deployment metadata names that SHA; the live site visibly reflects Phase 1.

### WS-1 — Restore the QA harness *(unblocks G3; everything else needs it)*

Recreate the two lost scripts and **commit them** (they are tooling, not docs):

- `scripts/qa-walkthrough.cjs` — puppeteer-core against installed Chrome/Brave; drives
  preloader → entrance → corridor → each of the 4 rooms → back; asserts **0 console errors, 0 page
  errors, 0 failed requests, 0 WebGL context losses**; samples FPS per room; writes tagged PNGs.
- `scripts/qa-lighthouse.cjs` — Lighthouse via chrome-launcher, desktop preset + simulated
  throttling, per route; writes JSON + a score table.
- Deep-link note (from M0): room routes are **History-API client routes, not Next routes** — the
  harness must navigate by clicking doors, not by HTTP GET.
- Wire both into `package.json` (`qa:walkthrough`, `qa:lighthouse`) so they cannot rot silently again.
- QA-only packages install with `npm i --no-save`; they must **never** enter `package.json` deps.
- Output to a committed path (e.g. `qa-evidence/`), **not** the gitignored `docs/`.

**Acceptance:** both run green against `next start` (production, never dev — rule #7), emit
artifacts, and a double run agrees within ±5 points.

### WS-2 — Produce the missing evidence *(closes G2, G4)*

1. Capture before/after PNG pairs for **all four rooms** (`M2`…`M5-before/after.png`) with the WS-1
   harness. "Before" = build at `9ab1f8e` (M0), "after" = HEAD.
2. Re-measure the Lighthouse baseline at `9ab1f8e` and at HEAD, per route.
3. Write the missing **`docs/room-realism/M2-gallery.md`**.
4. Write **`scripts/check-m2-gallery.cjs`** to the standard of the other four — assert: sunset IBL
   present, both warm spot hexes `#ff8fb0` / `#fff0d9`, `ContactShadows` present, StandardMaterials
   under `isStylized`, legacy BasicMaterial fallback intact, card layout untouched, gradient tokens
   unmodified, no new deps.
5. **Actually look at the screenshots.** If a room does not read as its DESIGN-PRD mood, that is a
   finding to fix — not a box to tick. M2's "sunlit print lab", M3's "monitor glow / neon spill"
   and M4's "dreamy sunset" are currently unviewed claims.

**Acceptance:** 8 PNGs + 4 Lighthouse JSONs committed; `check-m2-gallery.cjs` all-PASS; per-room
score table written; **an explicit written visual verdict per room.**

### WS-3 — Put reports back under version control *(closes G5)*

Narrow the ignore from `/docs/` to only scratch areas (e.g. `docs/scratch/`), and re-add
`docs/PRD.md`, `docs/DESIGN-PRD.md`, `docs/room-realism/*`, `docs/PRD-phase2.md`. The PRDs and
reports are project documentation and should be reviewable on GitHub.

**Acceptance:** the milestone reports appear on GitHub; `git status` clean; build still green.

### WS-4 — Make the perf budget real *(the "35 is the baseline" problem)*

The current ceiling is a band around a **35-point WebGL page**. Replace it with absolute floors a
build can fail:

| Metric | Current | Phase-2 floor |
|---|---|---|
| Lighthouse `/` | **35** (LCP 6.7 s, TBT 12,400 ms) | **≥ 45** first, **≥ 55** stretch |
| LCP `/` | 6.7 s | ≤ 4.0 s |
| TBT `/` | 12,400 ms | ≤ 2,000 ms |
| FPS, any room, desktop | ~57–60 (unreproducible) | ≥ 50, measured |
| FPS, any room, low-tier | never measured | ≥ 30, no context loss |

Candidate levers — **measure first, then pick; do not blind-apply**:

- **`Environment preset="sunset"`** pulls an HDRI from a **remote CDN at runtime** in *both* Gallery
  and About. That is a hard network dependency on third-party infrastructure, and a silent-failure
  risk if it's blocked. Audit it and consider self-hosting a ≤2k equirect WebP/KTX2 per DESIGN-PRD §5.
- `ContactShadows` blur cost in Gallery.
- Shader-compile stalls hidden behind the 99% preloader hold (M1 masks them nicely — too nicely).

**Acceptance:** table re-measured on a Vercel preview *and* locally; per-room numbers recorded;
floors met or shortfall explicitly accepted in writing.

### WS-5 — Owner-decided design gaps *(optional, gated on WS-0…4 green)*

Put G7 to Adarsh as an explicit choice:

- **Option A:** add `@react-three/postprocessing` (genuinely justified — DESIGN-PRD §3 contemplated
  bloom and the current stack provably cannot do it) → unlocks Studio bloom + About god-rays,
  tier-gated **OFF** on LOW. Must be re-measured against WS-4 floors.
- **Option B:** accept the no-postfx render and formally amend DESIGN-PRD §3 so "neon spill" means
  point-light spill — closing the spec-vs-ship gap honestly.
- Contact fireflies and Studio code reflections: add only if WS-4 proves headroom exists.

**Acceptance:** Adarsh's written choice; the spec amended to match whatever actually ships.

---

## 4. Decisions needed from Adarsh (blocking)

| # | Question | Options | Blocks |
|---|---|---|---|
| D1 | ~~Force-push~~ **Resolved:** remote is a strict ancestor → plain fast-forward push. Approve pushing `codex/electronics-theme`? | push now / hold | WS-0 |
| D2 | Which branch is Vercel production, and does `main` (30+ commits stale) get merged? **Cannot be read from this machine** — needs dashboard access. | codex branch / merge to main | WS-0 |
| D3 | Postprocessing dep for bloom + god-rays? | A: add it / B: amend spec | WS-5 |
| D4 | Un-ignore `docs/` so reports live on GitHub? | yes / keep ignored | WS-3 |

## 5. Constraints carried forward unchanged

Milestones in order; per-milestone acceptance loop before commit; message format
`feat(room-realism): P2-<n> - <short desc>`. Hallway (`#fafafa` pencil aesthetic, auto-opening
segment doors) and language-medallion door components stay **untouched** — re-run the same diff
sweep (`git diff <base>..HEAD -- corridor/ entrance/` must be empty) after every WS. No new
dependencies unless genuinely required and justified — D3 is the only live candidate. Assets =
Adarsh's own photos or Unsplash/Pexels, WebP-compressed, ≤1.5 MB per room.
**Test only via `npm run build && next start`** — never dev (rule #7). Blocked ⇒ **stop and report
the exact blocker**; never guess or silently skip. Keep `NEXT_PUBLIC_REALISM_MODE=legacy` green as
the rollback path.

## 6. Risks

- ⚠️ **Verification hygiene, not data-loss:** pushing is a plain fast-forward and destroys nothing.
  The real single-copy risk is the opposite one: **all 11 real commits exist only on this one
  laptop (G1)** — that is what the push is for.
- **A QA harness can silently lie.** The previous session shipped six 1×1-pixel PNGs as "screenshots"
  (G2). Every harness must assert on output dimensions/non-zero size and fail loudly, never write a
  stub on failure.
- Headless WebGL here runs on a software/emulated GPU driver — FPS and VRAM numbers from it are
  indicative only, never authoritative. Record the driver string alongside every measurement.
- Lighthouse on a WebGL-heavy route is noisy; compare like-for-like (same machine, same mode, same
  flags) and publish the run-to-run variance, not a single number.
- `Environment preset` remote-CDN dependency (WS-4) can silently degrade two rooms at once.
- Restoring `/docs/` to git (WS-3) will surface previously hidden files in review — expect noise,
  and re-read each report against reality before publishing it: at least two are stale or
  over-claiming (`AUDIT.md` describes a superseded state; `M0-lighthouse-baseline.md` cites
  files that do not exist).

## 7. Non-goals

Hallway redesign · room renaming (no PCB/EMBEDDED/IOT/DRONE/RTL labels) · replacing the language
medallions · full photoreal HDRI/photo-wall replacement · new rooms · CMS integration · geometry
replacement in any room · merging to `main` without D2.

## 8. Definition of done (Phase 2)

- [ ] **WS-0** `1e96607`-or-later on the Vercel production branch; live site matches
- [ ] **WS-1** harness scripts committed + wired into `package.json`; green twice
- [ ] **WS-2** 8 real screenshots + 4 Lighthouse reports committed; `M2-gallery.md` and
      `check-m2-gallery.cjs` exist and pass
- [ ] **WS-3** milestone reports visible on GitHub
- [ ] **WS-4** absolute perf floors met, or shortfall explicitly accepted in writing
- [ ] **WS-5** D3 answered; spec and shipped code agree
- [ ] **Throughout** hallway diff still empty · no unjustified deps · `legacy` build still green ·
      `prefers-reduced-motion` runtime-proven in all four rooms (G6)
- [ ] **Standing rule:** no acceptance item is signed off on a placeholder. If a measurement can't
      be made, say so — do not generate a stub and call it evidence.

## 9. Repro commands (what this audit actually ran)

```bash
git rev-parse HEAD && git rev-parse origin/codex/electronics-theme
git merge-base --is-ancestor 1e96607 origin/codex/electronics-theme; echo $?   # 1 = NOT pushed
git --no-pager log origin/codex/electronics-theme..HEAD --oneline              # 11 local-only commits
git --no-pager diff --name-only 9ab1f8e..HEAD                                  # scope since M0
git --no-pager diff 9ab1f8e..HEAD -- components/itom/src/components/canvas/corridor/ \
                             components/itom/src/components/canvas/entrance/   # empty = rule #4 OK
git --no-pager diff 9ab1f8e..HEAD -- package.json                              # no deps added
git show b9da5a2:qa-screenshots/M3-after.png | head -c 24 | xxd                # 1x1 PNG proof

npm run build                                    # ✓ 11/11 pages, / 48 kB / 136 kB
NEXT_PUBLIC_REALISM_MODE=legacy npm run build    # ✓ rollback path green

node scripts/test-progress-ease.cjs              # M1 all pass
node scripts/check-m3-studio.cjs                 # 13/13
node scripts/check-m4-about.cjs                  # 10/10
node scripts/check-m5-contact.cjs                # 10/10
node scripts/check-m6-badges.cjs                 # 8/8
# no check-m2-gallery.cjs exists — see G4
```

---

**One-line summary:** the code is real and the build is green, but nothing is pushed, no screenshot
has ever existed, and the tool that would prove the perf bar was deleted — so Phase 2 is not a
visual programme at all. It is a *ship-and-prove* programme.





