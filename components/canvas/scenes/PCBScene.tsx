"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

import { SCENES } from "@/lib/sceneConfig";

/**
 * PCBScene — Circuit Hub frame.
 *
 * In the sketch aesthetic, this is a flat frame hanging on the left wall
 * of the corridor, containing a schematic-like drawing or text.
 */
export default function PCBScene() {
  const hub = SCENES.find((s) => s.key === "pcb");
  const group = useRef<THREE.Group>(null);

  if (!hub) return null;

  // It's on the left wall, so rotate to face the center
  const isLeft = hub.worldCenter[0] < 0;

  return (
    <group position={hub.worldCenter} rotation-y={isLeft ? Math.PI / 2 : -Math.PI / 2}>
      <group ref={group} position={[0, 4, 0]}> {/* Lift up to eye level */}
        {/* Frame background */}
        <mesh>
          <planeGeometry args={[16, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
        
        {/* Frame border/outline (sketch style) */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[16.5, 10.5]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>

        {/* Content Placeholder */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={1.2}
          color="#000000"
          font="/fonts/Inter-Bold.ttf" // Fallback to basic text for now
          anchorX="center"
          anchorY="middle"
        >
          Circuit Hub
        </Text>
      </group>
    </group>
  );
}
