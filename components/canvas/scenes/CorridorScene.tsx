"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * CorridorScene — Hand-drawn 3D Sketchbook Hallway
 *
 * Renders paper-textured floor and walls with architectural pencil wireframe lines,
 * baseboard trims, and structural room pillars down the Z-axis.
 */
export default function CorridorScene() {
  const group = useRef<THREE.Group>(null);

  const length = 850;
  const width = 40;
  const wallHeight = 24;

  // Pillar positions down the hallway matching each section
  const pillars = useMemo(() => {
    const arr: number[] = [];
    for (let z = 300; z >= -450; z -= 60) {
      arr.push(z);
    }
    return arr;
  }, []);

  return (
    <group ref={group} position={[0, -5, -400]}>
      {/* Floor (Warm sketch paper) */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f6f3eb" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Left Wall (Clean sketchbook paper) */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, wallHeight / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* --- Pencil Wireframe Trim Lines --- */}
      {/* Left Baseboard pencil line */}
      <mesh position={[-width / 2 + 0.1, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Right Baseboard pencil line */}
      <mesh position={[width / 2 - 0.1, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Left Crown pencil line */}
      <mesh position={[-width / 2 + 0.1, wallHeight, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Right Crown pencil line */}
      <mesh position={[width / 2 - 0.1, wallHeight, 0]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Floor Center Guide Line (pencil dashed feel) */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.06, 0.02, length]} />
        <meshBasicMaterial color="#2d2b27" />
      </mesh>

      {/* Vertical Pencil Seams / Pillars along hallway */}
      {pillars.map((z, i) => (
        <group key={`seam-${i}`} position={[0, 0, z]}>
          {/* Left vertical pencil seam */}
          <mesh position={[-width / 2 + 0.1, wallHeight / 2, 0]}>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>

          {/* Right vertical pencil seam */}
          <mesh position={[width / 2 - 0.1, wallHeight / 2, 0]}>
            <boxGeometry args={[0.08, wallHeight, 0.08]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>

          {/* Floor grid horizontal cross-line */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[width, 0.02, 0.05]} />
            <meshBasicMaterial color="#1a1917" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
