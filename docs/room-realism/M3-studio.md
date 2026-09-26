# M3 — Studio: maker-lab-at-night

Goal: keep the night command-center look (dark violet fog, neon accents) and
make the field degrade gracefully instead of being cut. Geometry untouched.

## What changed
- `components/itom/src/components/canvas/rooms/Studio/FloatingCodeParticles.jsx`
  - Low-tier clamp: `lowTier ? 24 : PARTICLE_COUNT` (60 → 24 glyphs) so
    `MULTI_MONITOR`-class devices keep their FPS budget.
  - `prefers-reduced-motion` freeze: `motionScale = 0` disables drift, self
    -rotation and tower parallax (`rotationOffset`) — calm static field.
  - Low-tier/reduced-motion detection is deferred to `useEffect` so SSR and
    first client render agree (no hydration mismatch).
  - `particleYOffsets` still keyed off the full seeded set (indexes stay
    aligned with the sliced render list).
- Already in place from M0/M3-prep (verified, not re-written):
  exact trio point lights `#8b5cff` / `#ff5d8f` / `#4dd8ff` at
  `[2,2,-6] / [-2,0,-5] / [0,-2,-8]` (distance 15, decay 2), ambient
  `#180d33`, low-tier single-ambient fallback; particle `COLORS` exact trio with
  `color={isStylized ? particle.color : "#1a1a1a"}` legacy monochrome.
  Night tokens untouched: fog `#140a2b`, background `#0d0620`, gradient
  `#180d33→#4a2a7d`.

## Explicitly skipped
- **Bloom/postprocessing**: `@react-three/postprocessing` is not a dependency
  and PRD §8.1 forbids new deps without justification. Glow stays faked with
  the accent point lights + emissive badges.
- **Monitor code reflections**: no perf headroom proof on throttled mobile;
  deferred rather than guessed.

## Acceptance — verified
`node scripts/check-m3-studio.cjs` → 13/13 PASS (trio lights, night fog/bg
tokens, particle trio, legacy monochrome, low-tier clamp, reduced-motion
freeze, seeded RNG, low-tier fallback, flag `!== 'legacy'`, tower+monitors
intact). `npm run build` → 11/11 pages, `/` 48 kB / 136 kB (M0 parity).
