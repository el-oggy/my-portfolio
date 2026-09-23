# M0 — Baseline (codex/electronics-theme)

Date: 2026-09-23
Branch: `codex/electronics-theme` (from `fix/audit-bugs-and-cleanup` @ 2e179fd)
Stack (from package.json): Next.js 14.2.35 / React 18 / @react-three/fiber 8.18.0 / @react-three/drei 9.122.0 / three 0.169.0 / GSAP 3.15.0 / framer-motion 11 / lenis 1.3.26. 3D wrapper IS react-three-fiber (R3F) — used throughout `components/itom/src/components/canvas/`.

## Steps run
- `git checkout -b codex/electronics-theme`
- `npm install --no-audit --no-fund` → `up to date in 1s` (sharp/postinstall allow-scripts warning only, pre-existing)
- `npm run build` → prebuild `check-assets.cjs`: `total static asset refs: 300 / all referenced assets exist ✓`; `next build`: `Compiled successfully`, 10/10 static pages, EXIT 0, zero errors
- `npx next lint` → EXIT 0, warnings only (pre-existing exhaustive-deps + no-img-element, no errors)
- `npx next start -p 3100` → `Ready in 437ms` (production server boots)

## Acceptance
- [x] `next build` completes, zero errors
- [~] `next start`: server boots clean; full preloader → hallway → 4-room browser walkthrough needs a real browser (virtual room routes `/gallery|/about|/studio|/contact` are History-API client routes, not Next routes — HTTP GET cannot exercise them). Verified instead: boot log clean, `check-assets` 300/300, room lazy chunks resolve (`RoomInterior.jsx` lazy imports Gallery/Studio/About/Contact present), no missing-asset build failure.
- [x] Prior Antigravity-session errors: none reproduced. `dev-out.log` shows only historical 200s. Nothing was broken → nothing fixed (no hallway / medallion files touched).

## Constraints respected
- Hallway (`#fafafa` pencil aesthetic, segment doors) untouched.
- Language-medallion door components untouched.
- No new dependencies. No new assets.
