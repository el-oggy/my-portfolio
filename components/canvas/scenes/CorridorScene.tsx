"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * CorridorScene — the physical hallway geometry.
 *
 * Provides a floor and walls that stretch down the Z-axis, creating the
 * architectural space for the scenes to hang as frames or doors.
 *
 * Aesthetics: Light sketch/paper style. Minimalist white/off-white materials.
 */
export default function CorridorScene() {
  const group = useRef<THREE.Group>(null);

  // The hallway stretches from Z=50 (behind camera start) down to Z=-800
  const length = 850;
  const width = 40; // distance between walls
  const wallHeight = 24;

  return (
    <group ref={group} position={[0, -5, -400]}>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#f0f0f0" roughness={1} metalness={0} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[width / 2, wallHeight / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length, wallHeight]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </mesh>
      
      {/* Subtle ceiling or top ambient fill if needed, but open top allows light */}
    </group>
  );
}
