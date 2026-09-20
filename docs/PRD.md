# PRD — Portfolio Polish: Bug Cleanup, Perf & Colorful Rooms

**Branch:** `fix/audit-bugs-and-cleanup` (ALL work happens here)
**HARD RULE:** Never switch to, merge into, or modify `main`. `main` is the live
published portfolio — it stays untouched. No merges, no checkouts of `main`.

## 1. Problem statement

The portfolio is an immersive 3D world: preloader → entrance doors (hero) →
infinite monochrome hallway → 4 rooms (Gallery, Studio, About, Contact).

1. **Load cost** — 259 textures / ~15.3 MB under `public/textures` (many
   duplicated `_painted.webp` variants), eager room imports, whole-graph shader
   compile at boot. Heavy time-to-interactive and frame stutters on mid/low
   devices.
2. **Drab rooms** — the hallway aesthetic is intentionally black & white paper
   (KEEP IT, unchanged). Rooms currently rely mostly on a gradient backdrop +
   fog; they should feel like "where the fun begins": theme-matched color,
   lighting and background detail per room.
3. **Door stutters** — perceptible delay/hitch between door open/close and the
   camera fly-through.
4. **Hero entrance doors are plain** — should carry the owner's engineering
   identity: symbols/logos for Verilog, SystemVerilog, C, C++, Python, Tcl
   scripting (hardware design + software skills).
5. **Residual bugs** — debug labels in the corridor, React hooks misuse, dead
   three.js props, per-frame allocations, a11y nits.

## 2. Goals / success criteria (defines "done" for the loop)

| #  | Goal | Target | How measured |
|----|------|--------|--------------|
| G1 | Zero console/page errors | 0 errors on `/`, `/gallery`, `/studio`, `/about`, `/contact`, `/email` | Brave harness (`scripts/audit.cjs`) |
| G2 | Boot to interactive | < 5 s desktop HIGH tier | preloader timing |
| G3 | Smooth interaction | ≥ 50 FPS corridor walk; no long-task spike on door open/close or room entry | PerformanceMonitor + harness |
| G4 | Payload | texture budget ≤ 12 MB; no texture > 100 KB where avoidable | `scripts/check-assets.cjs` |
| G5 | Guidelines/a11y | 0 violations of web-interface-guidelines in touched files | skill audit |
| G6 | Rooms visually distinct | each room: themed palette + lighting + decoration layer; hallway unchanged | visual review via screenshots |
| G7 | Hero door branding | skill symbols (Verilog, SystemVerilog, C, C++, Python, Tcl) on entrance doors | visual review |

## 3. Workstreams

### WS1 — Bug cleanup
- Commit the 4 in-flight fixes already in the tree (reduced-motion tier,
  deep-link ref fix, local content layer, next.config prune).
- Fix: debug `#{segmentIndex}` text in `CorridorSegment.jsx`; dead
  `roughness/metalness` on `meshBasicMaterial` in `DoorSection.jsx`;
  `useRef`-in-object-literal hooks violation in `NavigationUI.jsx`;
  `outline:none` without focus replacement in `ProjectLightbox.tsx`;
  per-frame `new THREE.Color()` in `RoomBackdrop.jsx`.
- Sweep `.scss`/UI for `transition: all`, `outline-none`, missing `aria-label`s.
- `npm run lint` + `npm run build` must stay green.

### WS2 — Render optimization
- Recompress oversized `.webp` (>100 KB, quality ≥ 80) with sharp; remove
  orphaned assets.
- Code-split the 4 rooms (React.lazy + Suspense) while preserving the
  keep-alive/warmup strategy so first entry doesn't hitch.
- Frame-loop hygiene: hoist per-frame allocations, no React setState per frame.
- Fix door open/close stutter: precompile door/reveal shaders during warmup,
  avoid texture uploads mid-animation, ensure GSAP tweens are interruptible.

### WS3 — Colorful rooms ("where the fun begins")
Hallway stays black & white. Each room gets a theme-matched decoration layer on
top of `RoomThemeConfig.js`, keeping the hand-drawn/paper art direction:
- **About** (sky/daydream): warm sun, colorful clouds, paper-plane accents.
- **Gallery** (candy pink): richer pinks/corals, colorful frame mats, confetti.
- **Studio** (cyber-violet night): neon emissive accents, colorful code
  particles, rim lighting.
- **Contact** (sunset sea): dusk-peach gradient, warm lighthouse beam, colorful
  wave/bottle accents.
- Rules: flat/emissive materials only, reuse geometries/materials, particle
  counts scale with `PerformanceContext` tier, ≤ ~10 extra draw calls per room.

### WS3b — Hero entrance door branding
- Add engineering skill symbols to the entrance doors shown right after the
  preloader: Verilog, SystemVerilog, C, C++, Python, Tcl — hand-drawn style,
  consistent with the paper aesthetic.

### WS4 — Automated verification loop (Brave, headless)
- `scripts/audit.cjs`: puppeteer-core + Brave, dev server on localhost,
  visits every route, captures console errors/pageerrors/failed requests,
  samples FPS + long tasks, screenshots each room.
- Loop: fix → run audit → classify → repeat until G1–G7 pass → final
  `npm run lint && npm run build` → commit on this branch.

## 4. Out of scope
Merging to `main`, deployment, new rooms, CMS integration, hallway redesign.

## 5. Risks
- Texture recompression may alter the hand-drawn look → quality ≥ 80,
  screenshot-compare.
- Lazy rooms could regress first-entry hitch → keep-alive warmup, verify G3.
- Room decoration could hurt low-tier FPS → tier-scaled particles + budget.
