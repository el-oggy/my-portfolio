# M4 — About: sunset sky

Goal: sunset-sky treatment on the daylight room without touching geometry or
animations (`InfiniteSkyManager`, islands, milestone spread/reveal, glider loop).

## What changed
- `components/itom/src/components/canvas/rooms/About/AboutRoom.jsx`
  - Added drei `Environment preset="sunset"` (same preset/pattern already used
    by the Gallery — shared asset, no new files).
  - Rebalanced the sunset key/fill: warm sun `#ffd5a3` key (`[10,18,-8]`,
    intensity 2.0) + cool sky fill `#7ebcff` (`[-12,6,8]`, 0.7) over the
    existing `#7ebcff → #ffd5a3` gradient tokens (read-only).
  - Volumetric `Clouds`/`Cloud` pair kept as-is.
  - Low-tier branch: baked warm/cool directional wash only — no IBL, no
    volumetric clouds.
- `components/itom/src/components/canvas/rooms/About/PaperAirplane.jsx`
  - Glider gets `meshStandardMaterial` (roughness 0.55, metalness 0) in
    stylized mode; legacy keeps `meshBasicMaterial`. Geometry, `Edges`, and the
    Phase-3 brush-wipe `onBeforeCompile` / `customProgramCacheKey` untouched.

## Explicitly skipped
- **God-rays**: no `@react-three/postprocessing` dependency; a volumetric pass
  is a fullscreen composer cost with no measured headroom. Reason recorded in
  the component comment instead of shipping an unproven effect.

## Acceptance — verified
`node scripts/check-m4-about.cjs` → 10/10 PASS (Environment sunset, warm/cool
hexes, clouds kept, low-tier branch, god-rays reason, glider PBR + wipe kept,
airplane flight anim refs, milestone reveal/spread refs).
`npm run build` → 11/11 pages clean.
