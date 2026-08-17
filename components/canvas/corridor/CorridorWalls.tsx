"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface CorridorWallsProps {
  zStart?: number;
  length?: number;
}

export default function CorridorWalls({
  zStart = 25,
  length = 200,
}: CorridorWallsProps) {
  const corridorWidth = 7.0;
  const wallHeight = 4.8;
  const zCenter = zStart - length / 2;

  // Load authentic hand-drawn textures
  const [
    floorTex,
    baseboardTex,
    wallTex,
    ceilingTex,
    plantTex,
    ventTex,
  ] = useTexture([
    "/textures/corridor/kawalekpodlogi.webp",
    "/textures/corridor/texturadoprogow.webp",
    "/textures/corridor/wall_texture.webp",
    "/textures/corridor/ceiling_texture.webp",
    "/textures/corridor/drzewkowdoniczce.webp",
    "/textures/corridor/kratkawentylacyjna.webp",
  ]);

  // Set repeat wrapping on textures
  useEffect(() => {
    if (floorTex) {
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(2, length / 4);
      floorTex.colorSpace = THREE.SRGBColorSpace;
      floorTex.needsUpdate = true;
    }
    if (baseboardTex) {
      baseboardTex.wrapS = baseboardTex.wrapT = THREE.RepeatWrapping;
      baseboardTex.repeat.set(length / 3, 1);
      baseboardTex.colorSpace = THREE.SRGBColorSpace;
      baseboardTex.needsUpdate = true;
    }
    if (wallTex) {
      wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
      wallTex.repeat.set(length / 6, 2);
      wallTex.colorSpace = THREE.SRGBColorSpace;
      wallTex.needsUpdate = true;
    }
    if (ceilingTex) {
      ceilingTex.wrapS = ceilingTex.wrapT = THREE.RepeatWrapping;
      ceilingTex.repeat.set(2, length / 6);
      ceilingTex.colorSpace = THREE.SRGBColorSpace;
      ceilingTex.needsUpdate = true;
    }
  }, [floorTex, baseboardTex, wallTex, ceilingTex, length]);

  // Plant and vent positions along corridor
  const decorations = useMemo(() => {
    const plants: number[] = [];
    const vents: number[] = [];
    for (let z = zStart - 10; z >= zStart - length + 10; z -= 24) {
      plants.push(z);
      vents.push(z - 12);
    }
    return { plants, vents };
  }, [zStart, length]);

  return (
    <group position={[0, 0, 0]}>
      {/* Floor with authentic wood plank texture */}
      <mesh position={[0, 0, zCenter]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Left Wall with authentic sketch paper texture */}
      <mesh
        position={[-corridorWidth / 2, wallHeight / 2, zCenter]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>

      {/* Right Wall with authentic sketch paper texture */}
      <mesh
        position={[corridorWidth / 2, wallHeight / 2, zCenter]}
        rotation-y={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>

      {/* Ceiling with authentic texture */}
      <mesh position={[0, wallHeight, zCenter]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[corridorWidth, length]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.95} />
      </mesh>

      {/* --- Authentic Hand-Drawn Baseboards --- */}
      <mesh position={[-corridorWidth / 2 + 0.02, 0.2, zCenter]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[length, 0.4]} />
        <meshBasicMaterial map={baseboardTex} transparent />
      </mesh>
      <mesh position={[corridorWidth / 2 - 0.02, 0.2, zCenter]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[length, 0.4]} />
        <meshBasicMaterial map={baseboardTex} transparent />
      </mesh>

      {/* --- Hand-drawn Corridor Decorations --- */}
      {decorations.plants.map((z, i) => (
        <group key={`decor-plant-${i}`}>
          {/* Potted Plant on left or right */}
          <mesh
            position={[i % 2 === 0 ? -corridorWidth / 2 + 0.6 : corridorWidth / 2 - 0.6, 0.9, z]}
            rotation-y={i % 2 === 0 ? Math.PI / 6 : -Math.PI / 6}
          >
            <planeGeometry args={[1.2, 1.8]} />
            <meshBasicMaterial map={plantTex} transparent />
          </mesh>
        </group>
      ))}

      {decorations.vents.map((z, i) => (
        <group key={`decor-vent-${i}`}>
          {/* Ventilation Grill High on Wall */}
          <mesh
            position={[-corridorWidth / 2 + 0.05, wallHeight - 0.8, z]}
            rotation-y={Math.PI / 2}
          >
            <planeGeometry args={[1.6, 0.8]} />
            <meshBasicMaterial map={ventTex} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}
