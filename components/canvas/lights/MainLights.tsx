"use client";

/**
 * Main light rig. A simple three-point setup:
 *  - Ambient: soft fill, prevents pure-black shadows.
 *  - Key: main directional light, casts soft shadows.
 *  - Rim/Back: separates subject from background.
 *
 * This will be expanded later with lights specific to each scene.
 */
export default function MainLights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#6f86b8" />
      <directionalLight
        position={[10, 30, 20]}
        intensity={1.2}
        color="#a7c9f8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
      />
      <pointLight
        position={[-20, 10, -50]}
        intensity={80}
        color="#7DD3FC"
        distance={400}
      />
    </>
  );
}
