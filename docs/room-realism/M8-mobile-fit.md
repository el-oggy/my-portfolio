# Mobile fit — portrait framing fix

Symptom (reported): desktop fits perfectly, phone framing doesn't fit the
screen ("doesn't fit the mobile screen quite well enough").

## Root cause
The 3D scene is authored for landscape with a fixed `fov: 60`. In portrait
(aspect ≈ 0.46) the horizontal FOV collapses from ~91° to ~30°, so the
entrance doors/signs and room compositions are cropped left/right — the view
reads as zoomed-in and off-screen. Viewport meta (`device-width`,
`initial-scale=1`), `.app { height: 100dvh }` and the `webgl-active` scroll
lock were already correct, so it was a camera problem, not CSS.

## Fix — commit `36eb2d5`
`components/ItomExperienceCore.jsx` gains `ResponsiveFov`, mounted inside the
Canvas:
- `fov = 60` when `aspect >= 1` (desktop/landscape: **unchanged**).
- `fov = min(85, 60 + (1 - max(aspect, 0.4)) * 40)` in portrait.
- Re-evaluated per frame → follows rotation and address-bar expand/collapse.
- Only the projection changes; entrance/door camera *position* tweens and all
  room choreography are untouched.

| Viewport | vFOV | hFOV | Before |
|---|---|---|---|
| iPhone 393×852 | 81.5° | 43.4° | hFOV 30.1° |
| Galaxy 384×854 | 82.0° | 42.7° | hFOV 29.4° |
| iPad 768×1024 | 70.0° | 55.4° | hFOV 41.6° |
| Desktop 1920×1080 | 60.0° | 91.5° | unchanged |

## Per-room audit (already responsive, no changes needed)
- **Studio**: `responsiveParams` keyed to `size.width` (<768 mobile, <1024
  tablet) drives tower radius/scale.
- **Contact**: `isMobile = innerWidth < 1000` repositions barrels/paper.
- **Gallery**: `matchMedia('(hover: hover)')` painted-vs-regular textures +
  `isMobile < 768` camera targets.
- **Corridor/entrance**: touch-swipe scroll (GSAP Observer), gyroscope
  parallax with iOS permission flow, `HeroText` responsive 320–1200 px scale.
- **About**: centered sky-flight scene — framing handled by the global FOV fix.

## Verification
- `npm run build` ✓ 11/11 pages, `/` 48 kB / 136 kB (baseline parity).
- Fresh `next start` smoke: `GET /` 200, `GET /email` 200.
- FOV math checked for iPhone/Galaxy/iPad/desktop (table above).

## How to re-test on a real phone
1. `npm run build` then `npx next start -H 0.0.0.0 -p 3301` on the PC.
2. On the phone (same Wi-Fi) open `http://<PC-LAN-IP>:3301`.
3. Or on desktop: Chrome DevTools → device toolbar → iPhone 14 Pro preset.
