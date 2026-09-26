# M2 — Gallery: sun-lit print lab

Goal: establish a sun-lit print lab aesthetic in the projects gallery with physical-based rendering (PBR) materials, warm key and fill spots, and sunset environment IBL, while preserving all project card interactions and geometry.

## What changed
- `components/itom/src/components/canvas/rooms/Gallery/GalleryRoom.jsx` (commit `71e4f1d`):
  - **PBR Floor & Materials**: Under `isStylized`, upgraded key surfaces from flat `MeshBasicMaterial` to `MeshStandardMaterial`:
    - Floor: `MeshStandardMaterial` (`roughness: 0.8`, `metalness: 0.1`, `side: THREE.DoubleSide`) receiving lighting and environment reflections.
    - Clothesline Ropes: `MeshStandardMaterial` (`color: '#8a8a8a'`, `roughness: 0.9`, `metalness: 0.0`).
    - Threshold: `MeshStandardMaterial` (`roughness: 0.85`, `metalness: 0.0`) with proper sRGB texture handling. Cloned from shared drei cache (`bbTexSrc.clone()`) to avoid duplicate downloads/GPU uploads.
    - Legacy fallback branch (`NEXT_PUBLIC_REALISM_MODE === 'legacy'`) preserves `MeshBasicMaterial` for all surfaces.
  - **Sun-lit Lighting Setup**:
    - Drei `Environment preset="sunset"` for high dynamic range Image-Based Lighting (IBL).
    - Ambient light: `#ff8fb0` (intensity 0.4) providing warm horizon bounce.
    - Warm key spot: position `[5, 10, 5]`, intensity 1.5, color `#fff0d9`, angle 0.5, penumbra 0.8.
    - Warm fill spot: position `[-6, 8, 4]`, intensity 0.6, color `#ff8fb0`, angle 0.6, penumbra 1.0.
    - `ContactShadows` at `[0, -0.69, -2]` (opacity 0.6, scale 20, blur 2, far 4).
  - **Tiered Performance Gating**:
    - High/mid tier (`isStylized && !isLowTierMode`): Environment sunset IBL, dual spot lights, contact shadows.
    - Low tier (`isStylized && isLowTierMode`): Simplified fallback with single ambient light (`#ff8fb0`, intensity 0.7) and directional light (`#fff0d9`, intensity 1.0) without IBL or expensive contact shadows.
- `components/itom/src/components/canvas/rooms/Gallery/PaperMaterial.jsx`:
  - Removed duplicate uniform declaration `shader.uniforms.mapPainted`.

## Explicitly skipped / Preserved
- **Card layout and geometry**: `clothesline` curve, `TubeGeometry`, card mesh count, and hanging mechanics kept byte-identical.
- **Audio & Interactions**: Positional audio (`szummiasta.mp3`), scroll physics, and project card modal interactions preserved untouched.
- **Paint transition shaders**: `onBeforeCompile` vertex/fragment injections and brush reveals untouched.

## Acceptance — verified
`node scripts/check-m2-gallery.cjs` → 14/14 PASS:
- Environment preset="sunset" verified
- Warm key spot `#fff0d9` at `[5, 10, 5]`
- Warm fill spot `#ff8fb0` at `[-6, 8, 4]`
- Warm ambient `#ff8fb0` verified
- ContactShadows preserved
- Low-tier baked fallback branch verified
- PBR floor `MeshStandardMaterial` in stylized (`roughness: 0.8`, `metalness: 0.1`)
- Legacy floor `MeshBasicMaterial` fallback verified
- PBR rope `MeshStandardMaterial` in stylized (`roughness: 0.9`, `metalness: 0.0`)
- Legacy rope `MeshBasicMaterial` fallback verified
- PBR threshold `MeshStandardMaterial` in stylized (`roughness: 0.85`, `metalness: 0.0`)
- Threshold texture cloned from shared drei cache (`bbTexSrc.clone()`)
- Clothesline rope system and tube geometry intact
- `NEXT_PUBLIC_REALISM_MODE !== 'legacy'` flag compatibility verified
