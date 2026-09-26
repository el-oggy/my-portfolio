# M5 — Contact: dusk beam token

Goal: light-touch only. The Contact room already sits closest to the design
target (dusk gradient + coastal props); do not re-stage it.

## What changed
- `components/itom/src/components/canvas/rooms/Contact/ContactRoom.jsx`
  - `LighthouseBeam` now reads its color from
    `getRoomTheme('contact').palette.beam` (`#ffd27a`) — the previously dead
    config token has exactly one consumer instead of a duplicated hex.
  - Everything else untouched: volumetric drei `SpotLight`, gate
    `isStylized && !isLowTierMode`, dusk gradient `#122036 → #ff9a55`,
    background `#182740`, ambient/directional `#182740`, dock (`moloTexture`),
    ship, lighthouse plane, `MessagePaper`, `SocialBarrel` (CV/EMAIL/TWITTER),
    email overlay.

## Explicitly skipped
- **Fireflies**: no measured headroom on throttled mobile; PRD says only add on
  headroom. Skipped and recorded rather than guessed.

## Acceptance — verified
`node scripts/check-m5-contact.cjs` → 10/10 PASS (beam consumes token, token
value kept, volumetric SpotLight, gating, dusk hexes in both config and room,
prop integrity, no stray firefly code, legacy-compatible flag).
`npm run build` → 11/11 pages clean.
