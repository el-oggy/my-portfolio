"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface CorridorWallsProps {
  zStart?: number;
  length?: number;
}

export default function CorridorWalls({
  zStart = 25,
  length = 200,
}: CorridorWallsProps) {
  const corridorWidth = 7.0;
  const wallHeight = 5.0;

  const zCenter = zStart - length / 2;

  // Vertical structural seams along the corridor
  const seams = useMemo(() => {
    const arr: number[] = [];
    for (let z = zStart; z >= zStart - length; z -= 8) {
      arr.push(z);
    }
    return arr;
  }, [zStart, length]);

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, 0, zCenter]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial color="#f6f3ea" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Floor Grid Hatch Lines */}
      <gridHelper
        args={[corridorWidth, corridorWidth * 2, "#1a1917", "#d8d3c5"]}
        position={[0, 0.01, zCenter]}
        scale={[1, 1, length / corridorWidth]}
      />

      {/* Left Wall */}
      <mesh
        position={[-corridorWidth / 2, wallHeight / 2, zCenter]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Right Wall */}
      <mesh
        position={[corridorWidth / 2, wallHeight / 2, zCenter]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, wallHeight, zCenter]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial color="#f4f1e6" roughness={0.95} />
      </mesh>

      {/* --- Pencil Baseboards & Crown Trims --- */}
      {/* Left Baseboard Line */}
      <mesh position={[-corridorWidth / 2 + 0.05, 0.05, zCenter]}>
        <boxGeometry args={[0.08, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>
      {/* Right Baseboard Line */}
      <mesh position={[corridorWidth / 2 - 0.05, 0.05, zCenter]}>
        <boxGeometry args={[0.08, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Left Crown Line */}
      <mesh position={[-corridorWidth / 2 + 0.05, wallHeight - 0.05, zCenter]}>
        <boxGeometry args={[0.08, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>
      {/* Right Crown Line */}
      <mesh position={[corridorWidth / 2 - 0.05, wallHeight - 0.05, zCenter]}>
        <boxGeometry args={[0.08, 0.1, length]} />
        <meshBasicMaterial color="#1a1917" />
      </mesh>

      {/* Structural Vertical Seams & Ceiling Beams */}
      {seams.map((z, idx) => (
        <group key={`beam-${idx}`} position={[0, 0, z]}>
          {/* Left Vertical Seam */}
          <mesh position={[-corridorWidth / 2 + 0.04, wallHeight / 2, 0]}>
            <boxGeometry args={[0.06, wallHeight, 0.06]} />
            <meshBasicMaterial color="#2d2b27" />
          </mesh>
          {/* Right Vertical Seam */}
          <mesh position={[corridorWidth / 2 - 0.04, wallHeight / 2, 0]}>
            <boxGeometry args={[0.06, wallHeight, 0.06]} />
            <meshBasicMaterial color="#2d2b27" />
          </mesh>
          {/* Ceiling Cross Beam */}
          <mesh position={[0, wallHeight - 0.05, 0]}>
            <boxGeometry args={[corridorWidth, 0.08, 0.08]} />
            <meshBasicMaterial color="#38342f" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
