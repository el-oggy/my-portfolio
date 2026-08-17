"use client";

/**
 * Clean gallery lighting for the paper/sketchbook corridor.
 */
export default function MainLights() {
  return (
    <>
      <ambientLight intensity={1.1} color="#fdfbf7" />
      <directionalLight
        position={[15, 40, 20]}
        intensity={1.4}
        color="#ffffff"
        castShadow
      />
      <pointLight
        position={[0, 15, -100]}
        intensity={30}
        color="#fffbeb"
        distance={300}
      />
    </>
  );
}
