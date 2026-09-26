# M6 — Electronics badges (optional, flagged off)

Goal: optional alt-set of hardware medallions for the Studio, invisible unless
explicitly enabled. Lowest priority — must never affect the default render.

## What changed
- `components/itom/src/components/canvas/rooms/Studio/ElectronicsBadges.jsx`
  - Expanded 2 → 5 deterministic plates: **RTL / MCU / CHIP / SENSOR / DRONE**
    (RTL gate, MCU, silicon chip, sensor node, drone prop) reusing the exact
    neon trio `#8b5cff` / `#ff5d8f` / `#4dd8ff` plus accent `#ffd94d` /
    `#6bffb8`.
  - `meshStandardMaterial` with `emissive` @ 0.35 so plates read as lit at
    night without a postprocessing bloom pass.
  - One `useFrame` bobs the whole group (`sin(t·0.8)·0.08`); hooks live in
    `ElectronicsBadgeSet`, so the flag-off path returns `null` before any hook
    runs (no conditional-hook hazard).
  - Deterministic positions; no `Math.random`; imports limited to
    `react` / `@react-three/fiber` / `@react-three/drei`.
- Mount unchanged and read-only in `StudioRoom.jsx`
  (`<ElectronicsBadges isStylized={isStylized} />`).

## Flag
`NEXT_PUBLIC_ELECTRONICS_BADGES === 'true'` **and** `isStylized`. Unset →
component returns `null`; default render byte-identical.

## Acceptance — verified
`node scripts/check-m6-badges.cjs` → 8/8 PASS (off-by-default gate, stylized
guard, five labels, exact trio, no `Math.random(`, isolated hooks, read-only
mount, import hygiene). `npm run build` → 11/11 pages clean.
